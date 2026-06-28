/** Envía texto a RawBT (Android + impresora Bluetooth). Ver https://rawbt.ru/start.html */

function buildRawBtIntent(text: string): string {
  try {
    const b64 = btoa(unescape(encodeURIComponent(text)));
    if (b64.length < 180_000) {
      return `intent:base64,${b64}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end`;
    }
  } catch {
    /* texto muy largo o caracteres no válidos */
  }
  return `intent:${encodeURI(text)}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end`;
}

function dispatchIntent(intent: string, useNavigation: boolean): boolean {
  if (useNavigation) {
    window.location.href = intent;
    return true;
  }

  const anchor = document.createElement("a");
  anchor.href = intent;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return true;
}

/**
 * Imprime por RawBT sin salir de la app (estación /impresion).
 */
export function tryPrintRawBt(text: string): boolean {
  if (!/Android/i.test(navigator.userAgent)) return false;

  try {
    return dispatchIntent(buildRawBtIntent(text), false);
  } catch {
    return false;
  }
}

/**
 * RawBT desde un clic del usuario (permite navegación si el anchor falla).
 */
export function tryPrintRawBtFromUserGesture(text: string): boolean {
  if (!/Android/i.test(navigator.userAgent)) return false;

  try {
    if (dispatchIntent(buildRawBtIntent(text), false)) return true;
  } catch {
    /* intentar con navegación */
  }

  try {
    return dispatchIntent(buildRawBtIntent(text), true);
  } catch {
    return false;
  }
}
