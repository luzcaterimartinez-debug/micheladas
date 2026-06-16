import { getApiUrl } from "@/lib/auth";

export const LS_MENU = "michelada_menu_v1";
export const LS_OUTBOX = "michelada_outbox_v1";
export const LS_SYNC_META = "michelada_sync_meta_v1";

let apiReachable = true;

export function isAppOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

/** navigator.onLine puede ser true sin DNS/internet; usar para evitar fetch innecesarios. */
export function isApiReachable(): boolean {
  return apiReachable;
}

export function shouldSyncWithServer(): boolean {
  return isAppOnline() && apiReachable;
}

export function markApiUnreachable(): void {
  if (!apiReachable) return;
  apiReachable = false;
  notifySyncChange();
}

export function markApiReachable(): void {
  if (apiReachable) return;
  apiReachable = true;
  notifySyncChange();
}

export async function checkServerReachable(): Promise<boolean> {
  if (!isAppOnline()) {
    markApiUnreachable();
    return false;
  }
  const base = getApiUrl();
  const url = base ? `${base}/api/health` : "/api/health";
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const ok = res.status === 200 || res.status === 503;
    if (ok) markApiReachable();
    else markApiUnreachable();
    return ok;
  } catch {
    markApiUnreachable();
    return false;
  }
}

export function isNetworkFailure(err: unknown): boolean {
  if (!isAppOnline()) return true;
  if (err instanceof TypeError) {
    markApiUnreachable();
    return true;
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    const failed =
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("load failed") ||
      msg.includes("name not resolved") ||
      msg.includes("err_name_not_resolved");
    if (failed) markApiUnreachable();
    return failed;
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
}
