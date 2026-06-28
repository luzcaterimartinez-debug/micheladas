/** Impresora térmica AON Business MPR-200 — papel 58 mm, ESC/POS. */
export const DEFAULT_PRINTER = {
  model: "AON MPR-200",
  paperMm: 58,
  printableMm: 48,
} as const;

const AUTO_PRINT_KEY = "micheladas_auto_print";
const PRINT_STATION_KEY = "micheladas_print_station";
const RAWBT_KEY = "micheladas_rawbt";

export function isPrintRoute(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return path === "/impresion" || path === "/barra";
}

export function isAutoPrintEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(AUTO_PRINT_KEY) !== "0";
}

export function setAutoPrintEnabled(enabled: boolean): void {
  localStorage.setItem(AUTO_PRINT_KEY, enabled ? "1" : "0");
}

/** Solo en /impresion o /barra con impresión automática activa. */
export function isPrintStation(): boolean {
  if (typeof window === "undefined") return false;
  if (!isPrintRoute()) return false;
  if (!isAutoPrintEnabled()) return false;
  return localStorage.getItem(PRINT_STATION_KEY) !== "0";
}

export function setPrintStation(enabled: boolean): void {
  localStorage.setItem(PRINT_STATION_KEY, enabled ? "1" : "0");
}

export function isPrintStationMarked(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRINT_STATION_KEY) !== "0";
}

/** RawBT en Android: imprime por Bluetooth sin diálogo del navegador. */
export function isRawBtPreferred(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(RAWBT_KEY);
  if (stored === "0") return false;
  if (stored === "1") return true;
  return /Android/i.test(navigator.userAgent);
}

export function setRawBtEnabled(enabled: boolean): void {
  localStorage.setItem(RAWBT_KEY, enabled ? "1" : "0");
}
