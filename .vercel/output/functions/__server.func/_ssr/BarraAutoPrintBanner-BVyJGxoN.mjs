import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { B as Button } from "./button-DTleohOI.mjs";
import { S as Switch } from "./switch-Ba5Cnj_m.mjs";
import { q as queueLabel, c as cn } from "./router-DZCtlrU8.mjs";
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
export {
  BarraAutoPrintBanner as B
};
