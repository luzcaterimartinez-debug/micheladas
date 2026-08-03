import { getApiUrl } from "@/lib/auth";

export const LS_MENU = "michelada_menu_v4";
export const LS_OUTBOX = "michelada_outbox_v1";
export const LS_SYNC_META = "michelada_sync_meta_v1";
const LS_QUOTA_UNTIL = "michelada_mysql_quota_until";
const LS_API_DOWN_UNTIL = "michelada_api_down_until";

let apiReachable = true;
let lastUnreachableAt = 0;
/** Si Hostinger cortó por max_connections_per_hour, no pegarle a MySQL hasta esta hora. */
let quotaBackoffUntil = 0;

/** Tras un 503 temporal, pausar sync (sin quemar Hostinger). */
const API_RECOVERY_COOLDOWN_MS = 2 * 60_000;
/** Hostinger reinicia la cuota ~cada hora. */
const QUOTA_BACKOFF_MS = 55 * 60_000;
/** 503 genérico (sin texto 1226): no reintentar MySQL por este rato. */
const SOFT_DB_BACKOFF_MS = 5 * 60_000;

function readStoredQuotaUntil(): number {
  if (typeof window === "undefined") return 0;
  try {
    const n = Number(localStorage.getItem(LS_QUOTA_UNTIL) || "0");
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeStoredQuotaUntil(until: number): void {
  if (typeof window === "undefined") return;
  try {
    if (until <= Date.now()) localStorage.removeItem(LS_QUOTA_UNTIL);
    else localStorage.setItem(LS_QUOTA_UNTIL, String(until));
  } catch {
    /* private mode */
  }
}

// Restaurar backoff entre recargas / pestañas.
if (typeof window !== "undefined") {
  const stored = readStoredQuotaUntil();
  if (stored > Date.now()) {
    quotaBackoffUntil = stored;
    apiReachable = false;
  }
}

export function isAppOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

/** navigator.onLine puede ser true sin DNS/internet; usar para evitar fetch innecesarios. */
export function isApiReachable(): boolean {
  return apiReachable && !isMysqlQuotaBackoff();
}

export function isMysqlQuotaBackoff(): boolean {
  if (Date.now() < quotaBackoffUntil) return true;
  const stored = readStoredQuotaUntil();
  if (stored > Date.now()) {
    quotaBackoffUntil = stored;
    return true;
  }
  return false;
}

export function mysqlQuotaBackoffRemainingMs(): number {
  const until = Math.max(quotaBackoffUntil, readStoredQuotaUntil());
  return Math.max(0, until - Date.now());
}

export function shouldSyncWithServer(): boolean {
  return isAppOnline() && apiReachable && !isMysqlQuotaBackoff();
}

function isQuotaErrorText(text: string | undefined | null): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes("max_connections_per_hour") ||
    t.includes("1226") ||
    t.includes("too many connections") ||
    (t.includes("user '") && t.includes("exceeded"))
  );
}

export function markMysqlQuotaBackoff(fromMessage?: string): void {
  if (fromMessage && !isQuotaErrorText(fromMessage) && fromMessage !== "force") return;
  const until = Date.now() + QUOTA_BACKOFF_MS;
  quotaBackoffUntil = until;
  writeStoredQuotaUntil(until);
  markApiUnreachable();
}

/** Pausa corta ante cualquier 503 de BD (aunque no traiga el texto 1226). */
export function markSoftDbBackoff(): void {
  // No acortar un backoff de cuota más largo.
  if (isMysqlQuotaBackoff()) return;
  const until = Date.now() + SOFT_DB_BACKOFF_MS;
  quotaBackoffUntil = until;
  writeStoredQuotaUntil(until);
  markApiUnreachable();
}

export function markApiUnreachable(): void {
  const wasReachable = apiReachable;
  apiReachable = false;
  lastUnreachableAt = Date.now();
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LS_API_DOWN_UNTIL, String(Date.now() + API_RECOVERY_COOLDOWN_MS));
    } catch {
      /* ignore */
    }
  }
  // No disparar reloads en cascada (reabrirían MySQL).
  if (wasReachable && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("michelada-api-down"));
  }
}

export function markApiReachable(): void {
  // No borrar backoff de cuota Hostinger: un /api/ping OK no significa que MySQL acepte conexiones.
  if (isMysqlQuotaBackoff()) {
    apiReachable = false;
    return;
  }
  if (apiReachable) return;
  apiReachable = true;
  writeStoredQuotaUntil(0);
  notifySyncChange();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("michelada-api-recovered"));
  }
}

/** Marca la API como caída ante errores 5xx o rate limit (evita polling que satura MySQL). */
export function markApiFailureFromStatus(status: number, bodyText?: string): void {
  if (isQuotaErrorText(bodyText)) {
    markMysqlQuotaBackoff(bodyText);
    return;
  }
  // Cualquier 503 de API en prod casi siempre es MySQL/Hostinger: activar modo local.
  if (status === 503 || status === 429) {
    markSoftDbBackoff();
    return;
  }
  if (status >= 500) {
    markApiUnreachable();
  }
}

export async function checkServerReachable(opts?: { force?: boolean }): Promise<boolean> {
  if (!isAppOnline()) {
    markApiUnreachable();
    return false;
  }
  // Durante cuota Hostinger no llamar ni ping de recuperación con MySQL detrás.
  if (!opts?.force && isMysqlQuotaBackoff()) {
    markApiUnreachable();
    return false;
  }

  const base = getApiUrl();
  // Solo /api/ping — nunca /api/health (health diagnosticaba MySQL y quemaba cuota).
  const pingUrl = base ? `${base}/api/ping` : "/api/ping";
  try {
    const res = await fetch(pingUrl, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      if (isMysqlQuotaBackoff()) {
        markApiUnreachable();
        return false;
      }
      markApiReachable();
      return true;
    }
    if (res.status >= 500 || res.status === 429) {
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
      msg.includes("quedó en cola") ||
      msg.includes("quedo en cola") ||
      msg.includes("reintentará") ||
      msg.includes("reintentara") ||
      msg.includes("conserva la") ||
      msg.includes("503") ||
      msg.includes("502") ||
      msg.includes("504") ||
      msg.includes("429") ||
      msg.includes("1226") ||
      msg.includes("max_connections")
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
