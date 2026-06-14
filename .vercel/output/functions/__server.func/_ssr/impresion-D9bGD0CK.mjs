import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { T as Toaster } from "../_libs/sonner.mjs";
import { B as BarraAutoPrintBanner } from "./BarraAutoPrintBanner-CdpPUn8Q.mjs";
import { B as Button } from "./button-oBP21pj8.mjs";
import { R as Route$4, a as clearSession, u as useComandas, q as queueLabel } from "./router-CzC-Ytu6.mjs";
import { M as MenuProvider, u as useMenu, i as isAutoPrintEnabled, a as useAutoPrintComandas, s as setAutoPrintEnabled } from "./menu-context-C3M4Xpk5.mjs";
import { P as PrinterCheck, b as LogOut, L as LoaderCircle } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./switch-Bp5CxUzP.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
function ImpresionRoute() {
  const {
    user
  } = Route$4.useRouteContext();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ImpresionPanel, { userName: user.nombre, onLogout: () => {
      clearSession();
      void navigate({
        to: "/login"
      });
    } })
  ] });
}
function ImpresionPanel({
  userName,
  onLogout
}) {
  const {
    comandas,
    loading
  } = useComandas();
  const {
    productos
  } = useMenu();
  const [autoPrint, setAutoPrint] = reactExports.useState(isAutoPrintEnabled);
  const {
    lastPrinted,
    printedCount
  } = useAutoPrintComandas(comandas, productos, autoPrint);
  function toggleAutoPrint(v) {
    setAutoPrintEnabled(v);
    setAutoPrint(v);
  }
  const pendientes = comandas.filter((c) => c.status === "pendiente").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "border-b px-4 py-3 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PrinterCheck, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: "Estación de impresión" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: userName })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "sm", onClick: onLogout, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4 mr-1" }),
        "Salir"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 max-w-lg w-full mx-auto p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BarraAutoPrintBanner, { enabled: autoPrint, onEnabledChange: toggleAutoPrint, lastPrinted, printedCount }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border p-6 text-center space-y-2", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin mx-auto text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-bold tabular-nums", children: pendientes }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "comandas en cola" }),
        lastPrinted && autoPrint && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground pt-2", children: [
          "Última impresión: ",
          queueLabel(lastPrinted.queueOrder),
          " · #",
          lastPrinted.folio
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center leading-relaxed px-2", children: "Deja esta pantalla abierta en la PC de barra con la impresora predeterminada configurada. Cuando el mesero envía desde su celular, el ticket sale aquí automáticamente." })
    ] })
  ] });
}
export {
  ImpresionRoute as component
};
