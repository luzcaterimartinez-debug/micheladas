import { queueLabel } from "@/lib/comanda-queue";
import { enqueuePrint } from "@/lib/print-queue";
import { DEFAULT_PRINTER } from "@/lib/printer-config";
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



/**
 * Abre una ventana popup vacía SINCRÓNICAMENTE dentro del gesto del usuario
 * (antes de cualquier await/setTimeout) para evitar que el bloqueador de popups
 * la bloquee. Luego se rellena con el HTML del ticket y se llama print().
 */
export function openPrintPopup(): Window | null {
  if (typeof window === "undefined") return null;
  const w = DEFAULT_PRINTER.paperMm;
  return window.open(
    "",
    "_blank",
    `width=${w * 4},height=600,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`,
  );
}

/**
 * Escribe el HTML del ticket en el popup ya abierto y llama print().
 * Si popup es null (fue bloqueado), intenta abrir una ventana de fallback.
 */
function runPrint(html: string, _silent: boolean, preOpenedPopup?: Window | null) {
  const popup = preOpenedPopup ?? null;

  const doWriteAndPrint = (win: Window) => {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();

    const doPrint = () => {
      try {
        win.print();
      } finally {
        setTimeout(() => {
          try { win.close(); } catch { /* ignorar */ }
        }, 1500);
      }
    };

    if (win.document.readyState === "complete") {
      setTimeout(doPrint, 350);
    } else {
      win.addEventListener("load", () => setTimeout(doPrint, 350));
      setTimeout(doPrint, 800); // seguro si el load ya ocurrió
    }
  };

  if (popup && !popup.closed) {
    doWriteAndPrint(popup);
    return;
  }

  // Popup bloqueado — intentar abrir de todas formas (puede fallar en móvil)
  const win = window.open("", "_blank");
  if (win) {
    doWriteAndPrint(win);
  }
}

/** Imprime de inmediato con diálogo usando un popup pre-abierto en el clic del usuario. */
export function printComandaDialogNow(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
  preOpenedPopup?: Window | null,
): void {
  runPrint(renderComandaTicket(c, productos), false, preOpenedPopup);
}

export function printComanda(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
  opts?: { silent?: boolean; dialog?: boolean; popup?: Window | null },
) {
  const forceDialog = opts?.dialog === true;
  const silent = Boolean(opts?.silent);
  const html = renderComandaTicket(c, productos);
  const plain = renderComandaTicketPlainText(c, productos);
  const useRawBt = !forceDialog && /Android/i.test(navigator.userAgent);
  const preOpenedPopup = opts?.popup;

  enqueuePrint(
    () => {
      if (useRawBt && tryPrintRawBt(plain)) return;
      runPrint(html, silent, preOpenedPopup);
    },
    { skipWait: useRawBt },
  );
}

export function printTestTicket(): void {
  const html = renderTestTicket();
  enqueuePrint(() => runPrint(html, false));
}

export function timeAgo(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  return `Hace ${h} h ${min % 60} min`;
}
