import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as getCachedMenu, F as FALLBACK_MENU, O as fetchMenu, P as flattenProductos, N as MICHELADAS, q as queueLabel } from "./router-DZCtlrU8.mjs";
function orderItemSubtitle(item) {
  const s = item.size?.trim();
  return s || null;
}
function faseOpcionNames(micheladaId, ids, productos = MICHELADAS) {
  const m = productos.find((x) => x.id === micheladaId);
  return ids.map((id) => m?.faseOpciones.find((o) => o.id === id)?.name).filter(Boolean);
}
function renderComandaTicket(c, productos = MICHELADAS) {
  const turno = c.queueOrder > 0 ? c.queueOrder : c.folio;
  const rows = c.items.map((it) => {
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
  }).join("");
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
function runPrint(html, silent) {
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
      pointerEvents: "none"
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
function printComanda(c, productos = MICHELADAS, opts) {
  runPrint(renderComandaTicket(c, productos), Boolean(opts?.silent));
}
function timeAgo(ts) {
  const min = Math.floor((Date.now() - ts) / 6e4);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  return `Hace ${h} h ${min % 60} min`;
}
const PRINTED_KEY = "micheladas_printed_comandas";
const AUTO_PRINT_KEY = "micheladas_auto_print";
function todayKey() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function loadPrintedIds() {
  if (typeof window === "undefined") return /* @__PURE__ */ new Set();
  try {
    const raw = localStorage.getItem(PRINTED_KEY);
    if (!raw) return /* @__PURE__ */ new Set();
    const parsed = JSON.parse(raw);
    if (parsed.date !== todayKey() || !Array.isArray(parsed.ids)) return /* @__PURE__ */ new Set();
    return new Set(parsed.ids);
  } catch {
    return /* @__PURE__ */ new Set();
  }
}
function savePrintedIds(ids) {
  localStorage.setItem(
    PRINTED_KEY,
    JSON.stringify({ date: todayKey(), ids: [...ids] })
  );
}
function isAutoPrintEnabled() {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(AUTO_PRINT_KEY);
  return raw !== "0";
}
function setAutoPrintEnabled(enabled) {
  localStorage.setItem(AUTO_PRINT_KEY, enabled ? "1" : "0");
}
function markComandaPrinted(id) {
  if (typeof window === "undefined") return;
  const ids = loadPrintedIds();
  if (ids.has(id)) return;
  ids.add(id);
  savePrintedIds(ids);
}
function printComandaOnSend(comanda, productos) {
  if (typeof window === "undefined") return;
  printComanda(comanda, productos, { silent: true });
  markComandaPrinted(comanda.id);
}
function useAutoPrintComandas(comandas, productos, enabled) {
  const printedIds = reactExports.useRef(loadPrintedIds());
  const [lastPrinted, setLastPrinted] = reactExports.useState(null);
  const [printedCount, setPrintedCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const pendientes = comandas.filter((c) => c.status === "pendiente");
    for (const c of pendientes) {
      if (printedIds.current.has(c.id)) continue;
      printedIds.current.add(c.id);
      savePrintedIds(printedIds.current);
      printComanda(c, productos, { silent: true });
      setLastPrinted({
        folio: c.folio,
        queueOrder: c.queueOrder,
        cliente: c.cliente,
        at: Date.now()
      });
      setPrintedCount((n) => n + 1);
    }
  }, [comandas, enabled, productos]);
  return { lastPrinted, printedCount };
}
const MenuContext = reactExports.createContext(null);
function MenuProvider({ children }) {
  const [menu, setMenu] = reactExports.useState(() => getCachedMenu(FALLBACK_MENU));
  const [loading, setLoading] = reactExports.useState(true);
  const refetch = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      setMenu(await fetchMenu());
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void refetch();
  }, [refetch]);
  const productos = reactExports.useMemo(() => flattenProductos(menu.categorias), [menu.categorias]);
  const faseOpciones = reactExports.useMemo(
    () => menu.fases.flatMap((f) => f.opciones),
    [menu.fases]
  );
  const value = reactExports.useMemo(
    () => ({
      categorias: menu.categorias,
      productos,
      adiciones: menu.adiciones,
      fases: menu.fases,
      faseOpciones,
      loading,
      refetch,
      getProducto: (id) => productos.find((p) => p.id === id)
    }),
    [menu, productos, faseOpciones, loading, refetch]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuContext.Provider, { value, children });
}
function useMenu() {
  const ctx = reactExports.useContext(MenuContext);
  if (!ctx) {
    const productos = flattenProductos(FALLBACK_MENU.categorias);
    return {
      categorias: FALLBACK_MENU.categorias,
      productos,
      adiciones: FALLBACK_MENU.adiciones,
      fases: FALLBACK_MENU.fases,
      faseOpciones: FALLBACK_MENU.fases.flatMap((f) => f.opciones),
      loading: false,
      refetch: async () => {
      },
      getProducto: (id) => productos.find((p) => p.id === id)
    };
  }
  return ctx;
}
export {
  MenuProvider as M,
  useAutoPrintComandas as a,
  printComandaOnSend as b,
  faseOpcionNames as f,
  isAutoPrintEnabled as i,
  orderItemSubtitle as o,
  printComanda as p,
  setAutoPrintEnabled as s,
  timeAgo as t,
  useMenu as u
};
