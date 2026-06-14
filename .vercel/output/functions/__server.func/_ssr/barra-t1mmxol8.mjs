import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { T as Toaster, t as toast } from "../_libs/sonner.mjs";
import { P as PosHeader } from "./PosHeader-9n9F3IYs.mjs";
import { B as BarraAutoPrintBanner } from "./BarraAutoPrintBanner-CdpPUn8Q.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, C as Card, d as CardHeader, e as CardTitle, B as Badge, f as CardContent, g as ComandaViewDialog } from "./tabs-2dBX6xWM.mjs";
import { B as Button } from "./button-oBP21pj8.mjs";
import { e as Route$2, a as clearSession, u as useComandas, d as sortComandasByQueue, c as cn, q as queueLabel } from "./router-CzC-Ytu6.mjs";
import { M as MenuProvider, u as useMenu, i as isAutoPrintEnabled, a as useAutoPrintComandas, s as setAutoPrintEnabled, t as timeAgo, f as faseOpcionNames, o as orderItemSubtitle, p as printComanda } from "./menu-context-C3M4Xpk5.mjs";
import { d as Clock, R as RefreshCw, e as Package, f as Check, g as Printer } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tailwind-merge.mjs";
function BarraComandaCard({ comanda: c, onMarkLista, onMarkEntregada, compact }) {
  const { productos } = useMenu();
  const urgent = c.status === "pendiente" && Date.now() - c.createdAt > 10 * 60 * 1e3;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      className: c.status === "pendiente" ? urgent ? "border-destructive ring-1 ring-destructive/30" : "border-primary/40" : "",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: compact ? "pb-2 pt-4 px-4" : "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: compact ? "text-2xl font-black tabular-nums leading-none text-primary" : "text-3xl font-black tabular-nums leading-none text-primary",
                children: queueLabel(c.queueOrder)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: compact ? "text-sm text-muted-foreground mt-1" : "text-sm text-muted-foreground mt-1.5", children: [
              "Folio #",
              c.folio
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium mt-0.5", children: c.cliente }),
            c.mesa && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1", children: c.mesa })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
            c.status === "pendiente" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-accent text-accent-foreground gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              "Preparar"
            ] }),
            c.status === "lista" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-secondary text-secondary-foreground gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3 w-3" }),
              "Lista"
            ] }),
            c.status === "entregada" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
              "Entregada"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: timeAgo(c.createdAt) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: compact ? "px-4 pb-4 space-y-3" : "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: c.items.map((it) => {
            const tops = faseOpcionNames(it.micheladaId, it.selectedToppings, productos);
            const subtitle = orderItemSubtitle(it);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "li",
              {
                className: "rounded-lg bg-muted/50 p-3 border-l-4 border-primary",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-bold ${compact ? "text-base" : "text-lg"}`, children: it.micheladaName }),
                  subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: subtitle }),
                  tops.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm mt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Toppings:" }),
                    " ",
                    tops.join(", ")
                  ] }),
                  it.additions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm mt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Adiciones:" }),
                    " ",
                    it.additions.map((a) => a.name).join(", ")
                  ] }),
                  it.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-2 font-medium text-destructive bg-destructive/10 rounded px-2 py-1", children: it.notes })
                ]
              },
              it.id
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ComandaViewDialog, { comanda: c, iconOnly: compact, label: compact ? "Ver" : "Ver comanda" }),
            c.status === "pendiente" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: compact ? "sm" : "lg",
                className: "flex-1 min-w-[140px] gap-2",
                onClick: () => onMarkLista(c.id),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
                  "Lista para servir"
                ]
              }
            ),
            c.status === "lista" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "secondary",
                className: "gap-2",
                onClick: () => onMarkEntregada(c.id),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }),
                  "Entregada"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => printComanda(c, productos), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4" }) })
          ] })
        ] })
      ]
    }
  );
}
function ColumnHeader({
  title,
  count,
  icon: Icon,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex items-center justify-between rounded-lg px-3 py-2 mb-3",
        accent ? "bg-primary/10 text-primary" : "bg-muted"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-semibold text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
          title
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "text-xs font-bold rounded-full px-2.5 py-0.5",
              accent ? "bg-primary text-primary-foreground" : "bg-background"
            ),
            children: count
          }
        )
      ]
    }
  );
}
function BarraPanel({ userName, onLogout }) {
  const { comandas, updateStatus } = useComandas();
  const { productos } = useMenu();
  const [autoPrint, setAutoPrint] = reactExports.useState(isAutoPrintEnabled);
  const [mobileTab, setMobileTab] = reactExports.useState("activas");
  const [showHistorial, setShowHistorial] = reactExports.useState(false);
  const { lastPrinted, printedCount } = useAutoPrintComandas(comandas, productos, autoPrint);
  function toggleAutoPrint(v) {
    setAutoPrintEnabled(v);
    setAutoPrint(v);
  }
  const pendientes = reactExports.useMemo(
    () => comandas.filter((c) => c.status === "pendiente").sort(sortComandasByQueue),
    [comandas]
  );
  const listas = reactExports.useMemo(
    () => comandas.filter((c) => c.status === "lista").sort(sortComandasByQueue),
    [comandas]
  );
  const entregadas = reactExports.useMemo(
    () => comandas.filter((c) => c.status === "entregada").sort((a, b) => b.createdAt - a.createdAt).slice(0, 20),
    [comandas]
  );
  async function markLista(id) {
    try {
      await updateStatus(id, "lista");
      toast.success("Comanda lista para el mesero");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }
  async function markEntregada(id) {
    try {
      await updateStatus(id, "entregada");
      toast.success("Comanda entregada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }
  const emptyPendientes = pendientes.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PosHeader,
      {
        title: "Barra",
        userName,
        onLogout,
        containerClassName: "max-w-7xl",
        badge: pendientes.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-md bg-foreground/5 text-foreground text-[11px] font-medium px-2 py-1 tabular-nums", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3 opacity-60" }),
          pendientes.length
        ] }) : void 0
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        BarraAutoPrintBanner,
        {
          enabled: autoPrint,
          onEnabledChange: toggleAutoPrint,
          lastPrinted,
          printedCount
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ColumnHeader,
            {
              title: "Por preparar",
              count: pendientes.length,
              icon: Clock,
              accent: pendientes.length > 0
            }
          ),
          emptyPendientes ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed p-10 text-center text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Sin pedidos pendientes" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: pendientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            BarraComandaCard,
            {
              comanda: c,
              onMarkLista: markLista,
              onMarkEntregada: markEntregada
            },
            c.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnHeader, { title: "Listas para mesero", count: listas.length, icon: Package }),
          listas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl", children: "Nada listo aún" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: listas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            BarraComandaCard,
            {
              comanda: c,
              onMarkLista: markLista,
              onMarkEntregada: markEntregada,
              compact: true
            },
            c.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "xl:block hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ColumnHeader, { title: "Entregadas hoy", count: entregadas.length, icon: Check }),
          entregadas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 max-h-[70vh] overflow-y-auto", children: entregadas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            BarraComandaCard,
            {
              comanda: c,
              onMarkLista: markLista,
              onMarkEntregada: markEntregada,
              compact: true
            },
            c.id
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: mobileTab, onValueChange: (v) => setMobileTab(v), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "activas", className: "gap-1 text-xs sm:text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }),
            "Cola (",
            pendientes.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "listas", className: "gap-1 text-xs sm:text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-3.5 w-3.5" }),
            "Listas (",
            listas.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "historial", className: "gap-1 text-xs sm:text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
            "Hechas"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "activas", className: "space-y-4 mt-0", children: pendientes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-12", children: "Sin pedidos en cola" }) : pendientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          BarraComandaCard,
          {
            comanda: c,
            onMarkLista: markLista,
            onMarkEntregada: markEntregada
          },
          c.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "listas", className: "space-y-4 mt-0", children: listas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-12", children: "Sin comandas listas" }) : listas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          BarraComandaCard,
          {
            comanda: c,
            onMarkLista: markLista,
            onMarkEntregada: markEntregada,
            compact: true
          },
          c.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "historial", className: "space-y-3 mt-0", children: entregadas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-12", children: "Sin entregas recientes" }) : entregadas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          BarraComandaCard,
          {
            comanda: c,
            onMarkLista: markLista,
            onMarkEntregada: markEntregada,
            compact: true
          },
          c.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:block lg:hidden mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "w-full",
            onClick: () => setShowHistorial((v) => !v),
            children: [
              showHistorial ? "Ocultar" : "Ver",
              " entregadas (",
              entregadas.length,
              ")"
            ]
          }
        ),
        showHistorial && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-3", children: entregadas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          BarraComandaCard,
          {
            comanda: c,
            onMarkLista: markLista,
            onMarkEntregada: markEntregada,
            compact: true
          },
          c.id
        )) })
      ] })
    ] })
  ] });
}
function BarraRoute() {
  const {
    user
  } = Route$2.useRouteContext();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BarraPanel, { userName: user.nombre, onLogout: () => {
      clearSession();
      void navigate({
        to: "/login"
      });
    } })
  ] });
}
export {
  BarraRoute as component
};
