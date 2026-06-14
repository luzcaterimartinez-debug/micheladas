export const LS_MENU = "michelada_menu_v1";
export const LS_OUTBOX = "michelada_outbox_v1";
export const LS_SYNC_META = "michelada_sync_meta_v1";

export function isAppOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function isNetworkFailure(err: unknown): boolean {
  if (!isAppOnline()) return true;
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("load failed")
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
}
