import { getApiUrl } from "@/lib/auth";

export const LS_MENU = "michelada_menu_v4";
export const LS_OUTBOX = "michelada_outbox_v1";
export const LS_SYNC_META = "michelada_sync_meta_v1";

let apiReachable = true;
let lastUnreachableAt = 0;
/** Si Hostinger cortó por max_connections_per_hour, no pegarle a /api/health hasta esta hora. */
let quotaBackoffUntil = 0;

/** Tras un 503/5xx, esperar antes de volver a sincronizar (evita martillar MySQL). */
const API_RECOVERY_COOLDOWN_MS = 30_000;
/** Hostinger reinicia la cuota ~cada hora; no reintentar MySQL antes. */
const QUOTA_BACKOFF_MS = 50 * 60_000;

export function isAppOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

/** navigator.onLine puede ser true sin DNS/internet; usar para evitar fetch innecesarios. */
export function isApiReachable(): boolean {
  return apiReachable;
}

export function isMysqlQuotaBackoff(): boolean {
  return Date.now() < quotaBackoffUntil;
}

export function mysqlQuotaBackoffRemainingMs(): number {
  return Math.max(0, quotaBackoffUntil - Date.now());
}

export function shouldSyncWithServer(): boolean {
  return isAppOnline() && apiReachable && !isMysqlQuotaBackoff();
}

function isQuotaErrorText(text: string | undefined | null): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return t.includes("max_connections_per_hour") || t.includes("1226");
}

export function markMysqlQuotaBackoff(fromMessage?: string): void {
  if (fromMessage && !isQuotaErrorText(fromMessage) && fromMessage !== "force") return;
  quotaBackoffUntil = Date.now() + QUOTA_BACKOFF_MS;
  markApiUnreachable();
}

export function markApiUnreachable(): void {
  const wasReachable = apiReachable;
  apiReachable = false;
  lastUnreachableAt = Date.now();
  // No disparar michelada-sync-change aquí: los listeners recargan comandas/caja/mesas
  // y eso abre más conexiones MySQL cuando Hostinger ya cortó la cuota.
  if (wasReachable && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("michelada-api-down"));
  }
}

export function markApiReachable(): void {
  if (apiReachable && !isMysqlQuotaBackoff()) return;
  quotaBackoffUntil = 0;
  const was = apiReachable;
  apiReachable = true;
  if (!was) {
    notifySyncChange();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("michelada-api-recovered"));
    }
  }
}

/** Marca la API como caída ante errores 5xx o rate limit (evita polling que satura MySQL). */
export function markApiFailureFromStatus(status: number, bodyText?: string): void {
  if (isQuotaErrorText(bodyText)) {
    markMysqlQuotaBackoff(bodyText);
    return;
  }
  if (status >= 500 || status === 429) markApiUnreachable();
}

export async function checkServerReachable(opts?: { force?: boolean }): Promise<boolean> {
  if (!isAppOnline()) {
    markApiUnreachable();
    return false;
  }
  // Durante cuota Hostinger no llamar health (cada intento cuenta como conexión).
  if (!opts?.force && isMysqlQuotaBackoff()) {
    markApiUnreachable();
    return false;
  }

  const base = getApiUrl();
  const url = base ? `${base}/api/health` : "/api/health";
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => null)) as {
      database?: string;
      status?: string;
      database_error?: string;
      hint?: string;
    } | null;

    const errText = `${data?.database_error ?? ""} ${data?.hint ?? ""}`;
    if (isQuotaErrorText(errText)) {
      markMysqlQuotaBackoff(errText);
      return false;
    }

    const dbOk = res.ok && (data?.database === "ok" || data?.status === "ok");
    if (dbOk) {
      markApiReachable();
      return true;
    }
    if (res.status >= 500 || res.status === 429 || data?.database === "error") {
      markApiUnreachable();
    }
    return false;
  } catch (err) {
    const timedOut =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError" || /timeout|aborted/i.test(err.message));
    if (timedOut && apiReachable) {
      return true;
    }
    markApiUnreachable();
    return false;
  }
}

/** True si acabamos de marcar la API caída (evita martillar MySQL con sync/outbox). */
export function isApiRecoveryCooldown(): boolean {
  return (
    !apiReachable &&
    lastUnreachableAt > 0 &&
    Date.now() - lastUnreachableAt < API_RECOVERY_COOLDOWN_MS
  );
}

export function isNetworkFailure(err: unknown): boolean {
  if (!isAppOnline()) return true;
  if (err instanceof TypeError) {
    markApiUnreachable();
    return true;
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (isQuotaErrorText(msg)) {
      markMysqlQuotaBackoff(msg);
      return true;
    }
    const failed =
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("load failed") ||
      msg.includes("name not resolved") ||
      msg.includes("err_name_not_resolved") ||
      msg.includes("timeout") ||
      msg.includes("aborted");
    if (failed) markApiUnreachable();
    return failed;
  }
  return false;
}

/** Errores temporales del servidor — conservar la op en el outbox y reintentar. */
export function isRetryableSyncError(err: unknown): boolean {
  if (isNetworkFailure(err)) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("servidor no disponible") ||
      msg.includes("error del servidor") ||
      msg.includes("base de datos") ||
      msg.includes("503") ||
      msg.includes("502") ||
      msg.includes("504") ||
      msg.includes("429")
    );
  }
  return false;
}

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("michelada-store-change", { detail: { key } }));
}

export function notifySyncChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("michelada-sync-change"));
  try {
    const bc = new BroadcastChannel("michelada-sync");
    bc.postMessage({ type: "sync", at: Date.now() });
    bc.close();
  } catch {
    /* BroadcastChannel no disponible */
  }
}
