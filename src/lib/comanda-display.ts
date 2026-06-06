import { queueLabel } from "@/lib/comanda-queue";
import { MICHELADAS, type Comanda, type MicheladaType, type OrderItem } from "@/lib/micheladas-store";

/** Subtítulo bajo el nombre (solo comandas antiguas con campo size). */
export function orderItemSubtitle(item: OrderItem): string | null {
  const s = item.size?.trim();
  return s || null;
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

export function renderComandaTicket(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
): string {
  const turno = c.queueOrder > 0 ? c.queueOrder : c.folio;
  const rows = c.items
    .map((it) => {
      const tops = faseOpcionNames(it.micheladaId, it.selectedToppings, productos).join(", ");
      const adds = it.additions.map((a) => a.name).join(", ");
      return `
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-weight:bold">
            <span>${it.micheladaName}${it.size ? ` · ${it.size}` : ""}</span><span>$${it.total}</span>
          </div>
          ${tops ? `<div style="font-size:11px">Toppings: ${tops}</div>` : ""}
          ${adds ? `<div style="font-size:11px">Adiciones: ${adds}</div>` : ""}
          ${it.notes ? `<div style="font-size:11px;font-style:italic">Nota: ${it.notes}</div>` : ""}
        </div>`;
    })
    .join("");

  return `<!doctype html><html><head><title>${queueLabel(turno)} · #${c.folio}</title>
  <style>body{font-family:monospace;padding:12px;width:280px}h2{text-align:center;margin:4px 0}
  .turno{font-size:28px;font-weight:bold;text-align:center;margin:8px 0;letter-spacing:1px}
  hr{border:none;border-top:1px dashed #000;margin:8px 0}</style>
  </head><body>
  <h2>MICHELANDIA · BARRA</h2>
  <div class="turno">${queueLabel(turno).toUpperCase()}</div>
  <div style="text-align:center;font-size:11px">Folio #${c.folio}</div>
  <hr/>
  <div><b>Cliente:</b> ${c.cliente}</div>
  ${c.mesa ? `<div><b>Mesa:</b> ${c.mesa}</div>` : ""}
  <div><b>Hora:</b> ${new Date(c.createdAt).toLocaleString()}</div>
  <hr/>
  ${rows}
  <hr/>
  <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold">
    <span>TOTAL</span><span>$${c.total}</span>
  </div>
  </body></html>`;
}

function runPrint(html: string, silent: boolean) {
  if (silent) {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    Object.assign(iframe.style, {
      position: "fixed",
      right: "0",
      bottom: "0",
      width: "0",
      height: "0",
      border: "none",
      opacity: "0",
      pointerEvents: "none",
    });
    document.body.appendChild(iframe);
    const win = iframe.contentWindow;
    if (!win) {
      iframe.remove();
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      setTimeout(() => iframe.remove(), 1500);
    }, 250);
    return;
  }

  const w = window.open("", "_blank", "width=380,height=600");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 200);
}

export function printComanda(
  c: Comanda,
  productos: MicheladaType[] = MICHELADAS,
  opts?: { silent?: boolean },
) {
  runPrint(renderComandaTicket(c, productos), Boolean(opts?.silent));
}

export function timeAgo(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  return `Hace ${h} h ${min % 60} min`;
}
