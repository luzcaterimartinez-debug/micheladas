import { queueLabel } from "@/lib/comanda-queue";
import { enqueuePrint } from "@/lib/print-queue";
import { DEFAULT_PRINTER, isRawBtPreferred } from "@/lib/printer-config";
import { tryPrintRawBt, tryPrintRawBtFromUserGesture } from "@/lib/rawbt-print";
import { openComandaTicketPage } from "@/lib/ticket-print-session";
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

const ticketReturnUrl = () =>
  typeof window !== "undefined" ? location.pathname + location.search : "/";

/** Abre /ticket con el ticket 58 mm (revisar; imprimir solo si el usuario lo pide). */
export function openComandaTicketView(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
  autoPrint = false,
): boolean {
  return openComandaTicketPage(renderComandaTicket(c, productos), ticketReturnUrl(), { autoPrint });
}

/** Abre /ticket con HTML de ticket (p. ej. prueba de impresora). */
export function openComandaTicketHtml(html: string, autoPrint = false): boolean {
  return openComandaTicketPage(html, ticketReturnUrl(), { autoPrint });
}

function dispatchToTicketOrRawBt(
  html: string,
  plain: string,
  opts: { autoPrint: boolean; userGesture?: boolean },
): boolean {
  if (isRawBtPreferred()) {
    const ok = opts.userGesture ? tryPrintRawBtFromUserGesture(plain) : tryPrintRawBt(plain);
    if (ok) return true;
  }
  return openComandaTicketPage(html, ticketReturnUrl(), { autoPrint: opts.autoPrint });
}

/** @deprecated Los popups suelen bloquearse en móvil. */
export function openPrintPopup(): Window | null {
  return null;
}

export type PrintTicketResult = "rawbt" | "ticket" | false;

/**
 * Abre el ticket en /ticket (o RawBT si está activo). No imprime hasta que el usuario lo pida.
 */
export function printComandaDialogNow(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
  _preOpenedPopup?: Window | null,
): PrintTicketResult {
  const html = renderComandaTicket(c, productos);
  const plain = renderComandaTicketPlainText(c, productos);
  if (plain && isRawBtPreferred() && tryPrintRawBtFromUserGesture(plain)) return "rawbt";
  return openComandaTicketPage(html, ticketReturnUrl(), { autoPrint: false }) ? "ticket" : false;
}

export function printComanda(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
  opts?: { silent?: boolean; dialog?: boolean; popup?: Window | null },
) {
  const forceDialog = opts?.dialog === true;
  const html = renderComandaTicket(c, productos);
  const plain = renderComandaTicketPlainText(c, productos);
  const useRawBt = !forceDialog && isRawBtPreferred();

  enqueuePrint(
    () => {
      dispatchToTicketOrRawBt(html, plain, { autoPrint: !forceDialog });
    },
    { skipWait: useRawBt },
  );
}

export function printTestTicket(): void {
  openComandaTicketHtml(renderTestTicket(), false);
}

export function timeAgo(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  return `Hace ${h} h ${min % 60} min`;
}