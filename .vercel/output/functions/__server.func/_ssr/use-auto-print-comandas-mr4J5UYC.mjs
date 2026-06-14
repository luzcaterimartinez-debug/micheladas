import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-BNhi5K8I.mjs";
import { S as Switch } from "./switch-DvJouEtm.mjs";
import { q as queueLabel, c as cn } from "./router-BGt08YE6.mjs";
import { p as printComanda } from "./menu-context-Clk78U5N.mjs";
import { P as PrinterCheck, g as Printer } from "../_libs/lucide-react.mjs";
function BarraAutoPrintBanner({
  enabled,
  onEnabledChange,
  lastPrinted,
  printedCount,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3",
        enabled ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900" : "bg-muted/50",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 min-w-0", children: [
          enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(PrinterCheck, { className: "h-5 w-5 text-emerald-600 shrink-0 mt-0.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-5 w-5 text-muted-foreground shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: enabled ? "Impresión automática activa" : "Impresión automática apagada" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: enabled ? "Los pedidos del mesero se imprimen aquí (PC con impresora). El celular solo envía." : "Activa esto en la computadora de barra conectada a la impresora." }),
            lastPrinted && enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-emerald-700 dark:text-emerald-400 mt-1", children: [
              "Último: ",
              queueLabel(lastPrinted.queueOrder),
              " · #",
              lastPrinted.folio,
              " ·",
              " ",
              lastPrinted.cliente
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
          printedCount > 0 && enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground tabular-nums", children: [
            printedCount,
            " hoy"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: enabled, onCheckedChange: onEnabledChange, "aria-label": "Impresión automática" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                className: "hidden sm:inline-flex",
                onClick: () => window.open("/impresion", "_blank"),
                children: "Pantalla impresión"
              }
            )
          ] })
        ] })
      ]
    }
  );
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
export {
  BarraAutoPrintBanner as B,
  isAutoPrintEnabled as i,
  setAutoPrintEnabled as s,
  useAutoPrintComandas as u
};
