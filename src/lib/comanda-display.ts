import { queueLabel } from "@/lib/comanda-queue";
import { formatAppDateTime, formatAppMoney } from "@/lib/local-date";
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
      font-size: 15px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .wrap { padding: 3.5mm 3.5mm 6mm; }
    .header { text-align: center; margin-bottom: 2mm; }
    .brand {
      display: block;
      font-family: "Segoe Script", "Brush Script MT", Georgia, cursive;
      font-style: italic;
      font-size: 28px;
      font-weight: bold;
      line-height: 1.15;
      letter-spacing: 0.5px;
    }
    .station {
      display: inline-block;
      margin-top: 3px;
      padding: 2px 10px;
      border: 2px solid #000;
      border-radius: 999px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .turno-box {
      border: 3px solid #000;
      border-radius: 4px;
      padding: 6px 4px 8px;
      margin: 8px 0 6px;
      text-align: center;
    }
    .turno-label {
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .turno {
      font-size: 42px;
      font-weight: bold;
      letter-spacing: 1px;
      line-height: 1;
    }
    .folio {
      text-align: center;
      font-size: 14px;
      margin-bottom: 2px;
    }
    .rule {
      border: none;
      border-top: 2px dashed #000;
      margin: 8px 0;
    }
    .rule-double {
      border: none;
      height: 0;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      margin: 8px 0;
      padding: 1px 0;
    }
    .meta-block { margin: 2px 0 4px; }
    .meta {
      display: flex;
      gap: 6px;
      font-size: 15px;
      margin: 3px 0;
    }
    .meta-k {
      font-weight: bold;
      min-width: 4.2em;
      flex-shrink: 0;
    }
    .meta-v { flex: 1; word-break: break-word; }
    .section-title {
      text-align: center;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin: 2px 0 6px;
    }
    .item {
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px dotted #000;
      page-break-inside: avoid;
    }
    .item:last-child {
      border-bottom: none;
      padding-bottom: 0;
      margin-bottom: 4px;
    }
    .item-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      font-weight: bold;
      font-size: 17px;
    }
    .item-name { flex: 1; word-break: break-word; }
    .item-price { white-space: nowrap; }
    .item-extra {
      font-size: 14px;
      margin-top: 3px;
      padding-left: 2px;
      word-break: break-word;
    }
    .item-note {
      font-size: 14px;
      font-style: italic;
      margin-top: 4px;
      padding: 3px 0 3px 6px;
      border-left: 3px solid #000;
    }
    .total-box {
      border: 3px solid #000;
      border-radius: 4px;
      padding: 8px 10px;
      margin-top: 4px;
    }
    .total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 22px;
      font-weight: bold;
    }
    .total span:first-child {
      font-size: 14px;
      letter-spacing: 1.5px;
    }
    .foot {
      text-align: center;
      font-size: 11px;
      margin-top: 10px;
      letter-spacing: 0.3px;
    }
    .thanks {
      text-align: center;
      font-size: 13px;
      font-style: italic;
      margin-top: 8px;
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
      const adds = it.additions.map((a) => {
        const q = Math.max(1, a.quantity ?? 1);
        return q > 1 ? `${q}× ${a.name}` : a.name;
      });
      const label = orderItemLabel(it);
      const extras: string[] = [];
      if (tops.length) extras.push(`+ ${tops.join(", ")}`);
      if (adds.length) extras.push(`Adic: ${adds.join(", ")}`);
      if ((it.llevarExtra ?? 0) > 0) extras.push(`Para llevar +${formatAppMoney(it.llevarExtra!)}`);

      return `
        <div class="item">
          <div class="item-head">
            <span class="item-name">${esc(label)}</span>
            <span class="item-price">${formatAppMoney(it.total)}</span>
          </div>
          ${extras.length ? `<div class="item-extra">${esc(extras.join(" · "))}</div>` : ""}
          ${it.notes ? `<div class="item-note">* ${esc(it.notes)}</div>` : ""}
        </div>`;
    })
    .join("");

  const hora = formatAppDateTime(c.createdAt, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(queueLabel(turno))}</title>
  <style>${ticketStyles()}</style></head><body>
  <div class="wrap">
  <div class="header">
    <span class="brand">Michelandia</span>
    <div><span class="station">Barra</span></div>
  </div>
  <div class="turno-box">
    <div class="turno-label">Turno</div>
    <div class="turno">${esc(queueLabel(turno).toUpperCase())}</div>
  </div>
  <div class="folio">Folio #${c.folio}</div>
  <hr class="rule"/>
  <div class="meta-block">
    <div class="meta"><span class="meta-k">Cliente</span><span class="meta-v">${esc(c.cliente)}</span></div>
    ${c.mesa ? `<div class="meta"><span class="meta-k">Mesa</span><span class="meta-v">${esc(c.mesa)}</span></div>` : ""}
    <div class="meta"><span class="meta-k">Hora</span><span class="meta-v">${esc(hora)}</span></div>
  </div>
  <hr class="rule"/>
  <div class="section-title">Pedido</div>
  ${rows}
  <hr class="rule-double"/>
  <div class="total-box">
    <div class="total"><span>TOTAL</span><span>${formatAppMoney(c.total)}</span></div>
  </div>
  <div class="thanks">¡Gracias!</div>
  <div class="foot">${DEFAULT_PRINTER.model} · ${DEFAULT_PRINTER.paperMm}mm</div>
  </div>
  </body></html>`;
}

export function renderTestTicket(): string {
  const now = formatAppDateTime(Date.now());
  return `<!doctype html><html><head><meta charset="utf-8"><title>Prueba</title>
  <style>${ticketStyles()}</style></head><body>
  <div class="wrap">
  <div class="header">
    <span class="brand">Michelandia</span>
    <div><span class="station">Prueba</span></div>
  </div>
  <div class="turno-box">
    <div class="turno-label">Ticket</div>
    <div class="turno">OK</div>
  </div>
  <hr class="rule"/>
  <div class="meta-block">
    <div class="meta"><span class="meta-k">Impresora</span><span class="meta-v">${esc(DEFAULT_PRINTER.model)}</span></div>
    <div class="meta"><span class="meta-k">Papel</span><span class="meta-v">${DEFAULT_PRINTER.paperMm} mm</span></div>
    <div class="meta"><span class="meta-k">Hora</span><span class="meta-v">${esc(now)}</span></div>
  </div>
  <hr class="rule-double"/>
  <p class="thanks">Si ves este ticket, la impresión funciona.</p>
  </div></body></html>`;
}

const LINE = "------------------------------------------";

export function renderComandaTicketPlainText(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
): string {
  const turno = c.queueOrder > 0 ? c.queueOrder : c.folio;
  const hora = formatAppDateTime(c.createdAt, {
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
    lines.push(`${label}  ${formatAppMoney(it.total)}`);
    const tops = faseOpcionNames(it.micheladaId, it.selectedToppings, productos);
    if (tops.length) lines.push(`  + ${tops.join(", ")}`);
    const adds = it.additions.map((a) => {
      const q = Math.max(1, a.quantity ?? 1);
      return q > 1 ? `${q}× ${a.name}` : a.name;
    });
    if (adds.length) lines.push(`  Adic: ${adds.join(", ")}`);
    if ((it.llevarExtra ?? 0) > 0) lines.push(`  Para llevar +${formatAppMoney(it.llevarExtra!)}`);
    if (it.notes) lines.push(`  * ${it.notes}`);
  }

  lines.push(LINE, `TOTAL  ${formatAppMoney(c.total)}`, "", DEFAULT_PRINTER.model);
  return lines.join("\n");
}

export function renderTestTicketPlainText(): string {
  const now = formatAppDateTime(Date.now());
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

/** Abre /ticket con el ticket 80 mm (revisar; imprimir solo si el usuario lo pide). */
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