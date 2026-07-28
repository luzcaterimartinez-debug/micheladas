/** Zona horaria del negocio: Colombia (sin DST). */
export const APP_TIMEZONE = "America/Bogota";
export const APP_LOCALE = "es-CO";

/** Fecha de calendario en Colombia como YYYY-MM-DD. */
export function localDateIso(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** True si ambos instantes caen el mismo día civil en Colombia. */
export function isSameAppDay(a: Date | number, b: Date | number = Date.now()): boolean {
  return localDateIso(new Date(a)) === localDateIso(new Date(b));
}

export function formatAppDateTime(
  value: Date | number,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  return new Date(value).toLocaleString(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
    ...options,
  });
}

export function formatAppTime(
  value: Date | number,
  options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  return new Date(value).toLocaleTimeString(APP_LOCALE, {
    timeZone: APP_TIMEZONE,
    ...options,
  });
}

export function formatAppMoney(
  n: number,
  options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
): string {
  return `$${n.toLocaleString(APP_LOCALE, options)}`;
}
