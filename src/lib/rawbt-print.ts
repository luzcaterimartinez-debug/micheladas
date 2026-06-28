/** Envía texto a RawBT (Android + impresora Bluetooth sin diálogo de Chrome). */
export function tryPrintRawBt(text: string): boolean {
  if (!/Android/i.test(navigator.userAgent)) return false;

  const schemes = [
  () => {
      const b64 = btoa(unescape(encodeURIComponent(text)));
      return `intent:base64,${b64}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end`;
    },
    () => `rawbt:${encodeURIComponent(text)}`,
    () => {
      const encoded = encodeURIComponent(text);
      return (
        `intent:#Intent;action=ru.a402d.rawbtprinter.action.PRINT;` +
        `type=text/plain;package=ru.a402d.rawbtprinter;S.text=${encoded};end`
      );
    },
  ];

  for (const build of schemes) {
    try {
      const href = build();
      const frame = document.createElement("iframe");
      frame.style.display = "none";
      frame.src = href;
      document.body.appendChild(frame);
      window.setTimeout(() => frame.remove(), 1500);
      return true;
    } catch {
      /* siguiente esquema */
    }
  }

  return false;
}
