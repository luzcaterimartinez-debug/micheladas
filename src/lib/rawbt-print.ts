import { isRawBtPreferred } from "@/lib/printer-config";

/** Envía texto a RawBT (Android + impresora Bluetooth sin diálogo de Chrome). */
export function tryPrintRawBt(text: string): boolean {
  if (!isRawBtPreferred()) return false;
  if (!/Android/i.test(navigator.userAgent)) return false;

  try {
    const encoded = encodeURIComponent(text);
    const intent =
      `intent:#Intent;action=ru.a402d.rawbtprinter.action.PRINT;` +
      `type=text/plain;S.text=${encoded};end`;

    const link = document.createElement("a");
    link.href = intent;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch {
    try {
      window.location.href = `rawbt:${encodeURIComponent(text)}`;
      return true;
    } catch {
      return false;
    }
  }
}
