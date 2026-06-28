import { queueLabel } from "@/lib/comanda-queue";
import { enqueuePrint } from "@/lib/print-queue";
import { DEFAULT_PRINTER, isRawBtPreferred } from "@/lib/printer-config";
import { tryPrintRawBt } from "@/lib/rawbt-print";
import { MICHELADAS, orderItemQuantity, type Comanda, type MicheladaType, type OrderItem } from "@/lib/micheladas-store";

/** Subtítulo bajo el nombre (tamaño legacy o cantidad). */
export function orderItemSubtitle(item: OrderItem): string | null {
  const size = item.size?.trim();
  const qty = orderItemQuantity(item);
  if (qty > 1) return `${qty} unidades`;
  return size || null;
}

export function orderItemLabel(item: OrderItem): string {
  const qty = orderItemQuantity(item);
  return qty > 1 ? `${qty}× ${item.micheladaName}` : item.micheladaName;
}

export function faseOpcionNames(
  micheladaId: string,
  ids: string[],
  productos: MicheladaType[] = MICHELADAS,
): string[] {
  const m = productos.find((x) => x.id === micheladaId);
  return ids
    .map((id) => m?.faseOpciones.find((o) => o.id === id)?.name)
    .filter(Boolean) as string[];
}

/** @deprecated Usar faseOpcionNames */
export const toppingNames = faseOpcionNames;

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ticketStyles(): string {
  const w = DEFAULT_PRINTER.paperMm;
  return `
    @page { size: ${w}mm auto; margin: 0; }
    * { box-sizing: border-box; }
    html, body {
      width: ${w}mm;
      max-width: ${w}mm;
      margin: 0;
      padding: 0;
      color: #000;
      background: #fff;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .wrap { padding: 2mm 2.5mm 4mm; }
    h2 {
      text-align: center;
      font-size: 12px;
      font-weight: bold;
      margin: 0 0 4px;
      letter-spacing: 0.5px;
    }
    .turno {
      font-size: 26px;
      font-weight: bold;
      text-align: center;
      margin: 6px 0;
      letter-spacing: 1px;
      line-height: 1.1;
    }
    .folio { text-align: center; font-size: 10px; margin-bottom: 4px; }
    hr {
      border: none;
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .meta { font-size: 11px; margin: 2px 0; }
    .item { margin-bottom: 8px; page-break-inside: avoid; }
    .item-head {
      display: flex;
      justify-content: space-between;
      gap: 4px;
      font-weight: bold;
      font-size: 12px;
    }
    .item-name { flex: 1; word-break: break-word; }
    .item-price { white-space: nowrap; }
    .item-extra { font-size: 10px; margin-top: 2px; word-break: break-word; }
    .item-note {
      font-size: 10px;
      font-style: italic;
      margin-top: 2px;
      padding-left: 4px;
      border-left: 2px solid #000;
    }
    .total {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: bold;
      margin-top: 4px;
    }
    .foot {
      text-align: center;
      font-size: 9px;
      margin-top: 8px;
      opacity: 0.85;
    }
  `;
}

export function renderComandaTicket(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
): string {
  const turno = c.queueOrder > 0 ? c.queueOrder : c.folio;
  const rows = c.items
    .map((it) => {
      const tops = faseOpcionNames(it.micheladaId, it.selectedToppings, productos);
      const adds = it.additions.map((a) => a.name);
      const label = orderItemLabel(it);
      const extras: string[] = [];
      if (tops.length) extras.push(`+ ${tops.join(", ")}`);
      if (adds.length) extras.push(`Adic: ${adds.join(", ")}`);

      return `
        <div class="item">
          <div class="item-head">
            <span class="item-name">${esc(label)}</span>
            <span class="item-price">$${it.total}</span>
          </div>
          ${extras.length ? `<div class="item-extra">${esc(extras.join(" · "))}</div>` : ""}
          ${it.notes ? `<div class="item-note">${esc(it.notes)}</div>` : ""}
        </div>`;
    })
    .join("");

  const hora = new Date(c.createdAt).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(queueLabel(turno))}</title>
  <style>${ticketStyles()}</style></head><body>
  <div class="wrap">
  <h2>MICHELANDIA · BARRA</h2>
  <div class="turno">${esc(queueLabel(turno).toUpperCase())}</div>
  <div class="folio">Folio #${c.folio}</div>
  <hr/>
  <div class="meta"><b>Cliente:</b> ${esc(c.cliente)}</div>
  ${c.mesa ? `<div class="meta"><b>Mesa:</b> ${esc(c.mesa)}</div>` : ""}
  <div class="meta"><b>Hora:</b> ${esc(hora)}</div>
  <hr/>
  ${rows}
  <hr/>
  <div class="total"><span>TOTAL</span><span>$${c.total}</span></div>
  <div class="foot">${DEFAULT_PRINTER.model} · ${DEFAULT_PRINTER.paperMm}mm</div>
  </div>
  </body></html>`;
}

export function renderTestTicket(): string {
  const now = new Date().toLocaleString("es-MX");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Prueba</title>
  <style>${ticketStyles()}</style></head><body>
  <div class="wrap">
  <h2>MICHELANDIA</h2>
  <div class="turno">PRUEBA</div>
  <hr/>
  <div class="meta">Impresora: ${esc(DEFAULT_PRINTER.model)}</div>
  <div class="meta">Papel: ${DEFAULT_PRINTER.paperMm} mm</div>
  <div class="meta">${esc(now)}</div>
  <hr/>
  <p class="meta">Si ves este ticket, la impresión automática de comandas funcionará correctamente.</p>
  </div></body></html>`;
}

const LINE = "--------------------------------";

export function renderComandaTicketPlainText(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
): string {
  const turno = c.queueOrder > 0 ? c.queueOrder : c.folio;
  const hora = new Date(c.createdAt).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [
    "MICHELANDIA · BARRA",
    "",
    queueLabel(turno).toUpperCase(),
    `Folio #${c.folio}`,
    LINE,
    `Cliente: ${c.cliente}`,
  ];
  if (c.mesa) lines.push(`Mesa: ${c.mesa}`);
  lines.push(`Hora: ${hora}`, LINE);

  for (const it of c.items) {
    const label = orderItemLabel(it);
    lines.push(`${label}  $${it.total}`);
    const tops = faseOpcionNames(it.micheladaId, it.selectedToppings, productos);
    if (tops.length) lines.push(`  + ${tops.join(", ")}`);
    const adds = it.additions.map((a) => a.name);
    if (adds.length) lines.push(`  Adic: ${adds.join(", ")}`);
    if (it.notes) lines.push(`  * ${it.notes}`);
  }

  lines.push(LINE, `TOTAL  $${c.total}`, "", DEFAULT_PRINTER.model);
  return lines.join("\n");
}

export function renderTestTicketPlainText(): string {
  const now = new Date().toLocaleString("es-MX");
  return [
    "MICHELANDIA",
    "",
    "PRUEBA",
    LINE,
    `Impresora: ${DEFAULT_PRINTER.model}`,
    `Papel: ${DEFAULT_PRINTER.paperMm} mm`,
    now,
    LINE,
    "Impresion automatica OK",
  ].join("\n");
}

const PRINT_FRAME_ID = "michelada-print-frame";
const PRINT_OVERLAY_ID = "michelada-print-overlay";
const PRINT_STYLE_ID = "michelada-print-style";

function parseTicketHtml(fullHtml: string): { body: string; css: string } {
  const parsed = new DOMParser().parseFromString(fullHtml, "text/html");
  return {
    body: parsed.body.innerHTML,
    css: parsed.querySelector("style")?.textContent ?? "",
  };
}

function isMobileBrowser(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Ventana nueva con solo el ticket (más fiable en clic del usuario). */
function tryPrintViaBlankWindow(fullHtml: string): boolean {
  try {
    const printWin = window.open("", "_blank", "noopener,noreferrer");
    if (!printWin) return false;

    let printed = false;
    const cleanup = () => {
      window.setTimeout(() => {
        try {
          if (!printWin.closed) printWin.close();
        } catch {
          /* ventana ya cerrada */
        }
      }, 500);
    };

    const doPrint = () => {
      if (printed) return;
      printed = true;
      try {
        printWin.focus();
        printWin.print();
      } catch {
        cleanup();
        return;
      }
      printWin.addEventListener("afterprint", cleanup, { once: true });
      window.setTimeout(cleanup, 120_000);
    };

    printWin.document.open();
    printWin.document.write(fullHtml);
    printWin.document.close();

    if (printWin.document.readyState === "complete") {
      window.setTimeout(doPrint, 150);
    } else {
      printWin.addEventListener("load", () => window.setTimeout(doPrint, 150), { once: true });
      window.setTimeout(doPrint, 600);
    }

    return true;
  } catch {
    return false;
  }
}

/** Blob URL como respaldo si document.write falla. */
function tryPrintViaBlobWindow(fullHtml: string): boolean {
  try {
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const printWin = window.open(url, "_blank", "noopener,noreferrer");
    if (!printWin) {
      URL.revokeObjectURL(url);
      return false;
    }

    let printed = false;
    const cleanup = () => {
      URL.revokeObjectURL(url);
      window.setTimeout(() => {
        try {
          if (!printWin.closed) printWin.close();
        } catch {
          /* */
        }
      }, 500);
    };

    const doPrint = () => {
      if (printed) return;
      printed = true;
      try {
        printWin.focus();
        printWin.print();
      } catch {
        cleanup();
        return;
      }
      printWin.addEventListener("afterprint", cleanup, { once: true });
      window.setTimeout(cleanup, 120_000);
    };

    const waitReady = (attempt = 0) => {
      try {
        if (printWin.document?.readyState === "complete") {
          window.setTimeout(doPrint, 100);
          return;
        }
      } catch {
        /* */
      }
      if (attempt < 30) window.setTimeout(() => waitReady(attempt + 1), 50);
      else window.setTimeout(doPrint, 100);
    };
    waitReady();

    return true;
  } catch {
    return false;
  }
}

/** Overlay en la página: oculta toda la UI y deja solo el ticket al imprimir. */
function tryPrintViaOverlay(fullHtml: string): boolean {
  try {
    const { body, css } = parseTicketHtml(fullHtml);
    const w = DEFAULT_PRINTER.paperMm;

    document.getElementById(PRINT_STYLE_ID)?.remove();
    document.getElementById(PRINT_OVERLAY_ID)?.remove();

    const style = document.createElement("style");
    style.id = PRINT_STYLE_ID;
    style.textContent = `
      ${css}
      @media screen {
        #${PRINT_OVERLAY_ID} {
          position: fixed !important;
          left: -10000px !important;
          top: 0 !important;
          width: ${w}mm !important;
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: -1 !important;
        }
      }
      @media print {
        @page { size: ${w}mm auto; margin: 0; }
        html, body {
          width: ${w}mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #fff !important;
        }
        body > *:not(#${PRINT_OVERLAY_ID}),
        [data-radix-portal],
        [data-sonner-toaster] {
          display: none !important;
          visibility: hidden !important;
        }
        #${PRINT_OVERLAY_ID} {
          display: block !important;
          position: static !important;
          width: ${w}mm !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        #${PRINT_OVERLAY_ID} * {
          visibility: visible !important;
        }
      }
    `;

    const overlay = document.createElement("div");
    overlay.id = PRINT_OVERLAY_ID;
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = body;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const cleanup = () => {
      style.remove();
      overlay.remove();
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          window.focus();
          window.print();
        } catch {
          cleanup();
          return;
        }
        window.addEventListener("afterprint", cleanup, { once: true });
        window.setTimeout(cleanup, 90_000);
      });
    });

    return true;
  } catch {
    return false;
  }
}

/** Imprime desde el contentWindow del iframe (escritorio). */
function tryPrintViaIframe(fullHtml: string): boolean {
  try {
    document.getElementById(PRINT_FRAME_ID)?.remove();

    const iframe = document.createElement("iframe");
    iframe.id = PRINT_FRAME_ID;
    iframe.setAttribute("title", "Ticket comanda");
    iframe.setAttribute("aria-hidden", "true");
    Object.assign(iframe.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: `${DEFAULT_PRINTER.paperMm}mm`,
      height: "1px",
      border: "none",
      opacity: "0",
      pointerEvents: "none",
    });

    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    if (!win) {
      iframe.remove();
      return false;
    }

    const cleanup = () => iframe.remove();

    const doPrint = () => {
      try {
        win.focus();
        win.print();
      } catch {
        cleanup();
        return;
      }
      win.addEventListener("afterprint", cleanup, { once: true });
      window.setTimeout(cleanup, 90_000);
    };

    win.document.open();
    win.document.write(fullHtml);
    win.document.close();

    if (win.document.readyState === "complete") {
      window.setTimeout(doPrint, 200);
    } else {
      iframe.onload = () => window.setTimeout(doPrint, 200);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Imprime solo el ticket. Orden: RawBT → ventana nueva → blob → overlay → iframe.
 */
function runPrintTicket(fullHtml: string, plainText?: string, skipRawBt = false): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  if (!skipRawBt && plainText && isRawBtPreferred() && tryPrintRawBt(plainText)) {
    return true;
  }

  const mobile = isMobileBrowser();

  if (mobile) {
    if (tryPrintViaBlankWindow(fullHtml)) return true;
    if (tryPrintViaBlobWindow(fullHtml)) return true;
    if (tryPrintViaOverlay(fullHtml)) return true;
    return tryPrintViaIframe(fullHtml);
  }

  if (tryPrintViaBlankWindow(fullHtml)) return true;
  if (tryPrintViaIframe(fullHtml)) return true;
  if (tryPrintViaOverlay(fullHtml)) return true;
  return tryPrintViaBlobWindow(fullHtml);
}

/** @deprecated Los popups suelen bloquearse en móvil. */
export function openPrintPopup(): Window | null {
  return null;
}

function runPrint(html: string, _silent: boolean, _preOpenedPopup?: Window | null, plain?: string) {
  runPrintTicket(html, plain);
}

export type PrintTicketResult = "rawbt" | "browser" | false;

/**
 * Imprime el ticket con diálogo del sistema (llamar en el clic del usuario).
 */
export function printComandaDialogNow(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
  _preOpenedPopup?: Window | null,
): PrintTicketResult {
  const html = renderComandaTicket(c, productos);
  const plain = renderComandaTicketPlainText(c, productos);
  if (plain && isRawBtPreferred() && tryPrintRawBt(plain)) return "rawbt";
  return runPrintTicket(html, plain) ? "browser" : false;
}

export function printComanda(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
  opts?: { silent?: boolean; dialog?: boolean; popup?: Window | null },
) {
  const forceDialog = opts?.dialog === true;
  const silent = Boolean(opts?.silent);
  const preOpenedPopup = opts?.popup;
  const html = renderComandaTicket(c, productos);
  const plain = renderComandaTicketPlainText(c, productos);
  const useRawBt = !forceDialog && isRawBtPreferred();

  enqueuePrint(
    () => {
      if (useRawBt && tryPrintRawBt(plain)) return;
      runPrint(html, silent, preOpenedPopup, plain);
    },
    { skipWait: useRawBt },
  );
}

export function printTestTicket(): void {
  const html = renderTestTicket();
  const plain = renderTestTicketPlainText();
  runPrintTicket(html, plain);
}

export function timeAgo(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  return `Hace ${h} h ${min % 60} min`;
}