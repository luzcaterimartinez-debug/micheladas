import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent, g as ComandaViewDialog, B as Badge } from "./tabs-B8LtigXh.mjs";
import { M as MichelandiaBackground, T as Toaster, c as MeseroStepHeader, a as ThemedPanel, b as ThemedPanelHeader, d as MenuPriceRow, e as MichelandiaFooterBar, F as FlavorGridCard } from "./sonner-BRj2Ec0G.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-CHqgX7FO.mjs";
import { R as Root, I as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { M as Route, H as ROL_LABELS, a as clearSession, u as useComandas, f as useInventory, j as useMesas, E as getStoredSession, J as calcItemTotal, c as cn, L as getPendingCount, i as isAppOnline } from "./router-Cug9C9eT.mjs";
import { I as InventoryPanel, i as isFasePaso, p as parseFaseIdFromPaso, o as opcionesForFase, T as Textarea, n as normalizeProductPasos, P as PASO_NOTAS, f as fasePasoId, j as buildOrderDeductions } from "./inventory-deduction-8RikRdDC.mjs";
import { p as productBaseLabel, a as formatMenuPrice } from "./michelandia-theme-DVmC1I5Y.mjs";
import { L as Label, I as Input } from "./label-CJj8aDw5.mjs";
import { M as MenuProvider, u as useMenu, f as faseOpcionNames, b as printComandaOnSend, o as orderItemSubtitle } from "./menu-context-CKCt_eqj.mjs";
import { P as PosHeader } from "./PosHeader-6aQ2vg0r.mjs";
import { r as Boxes, n as ClipboardList, s as Users, h as Beer, L as LoaderCircle, A as ArrowLeft, Q as ArrowRight, u as Plus, V as Bell, f as Check, Y as Armchair, Z as ShoppingBag, _ as MapPin, v as Pencil, $ as User, K as ShoppingCart, O as ChevronUp, N as ChevronDown, x as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
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
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-label.mjs";
const Progress = reactExports.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = Root.displayName;
function MeseroListasBanner({ listas, onMarcarEntregada, className }) {
  if (listas.length === 0) return null;
  async function entregar(id, folio) {
    try {
      await onMarcarEntregada(id);
      toast.success(`Comanda #${folio} entregada`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ThemedPanel, { themeId: "adiciones", className: cn("mt-0", className), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 py-3 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-extrabold text-[#2e7d32] flex items-center gap-1.5 uppercase tracking-wide", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3.5 w-3.5" }),
      listas.length,
      " listo",
      listas.length === 1 ? "" : "s",
      " para servir"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5", children: listas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "li",
      {
        className: "flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold truncate text-slate-900", children: [
              "#",
              c.folio,
              " · ",
              c.mesa ?? "—",
              " · ",
              c.cliente
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-slate-500", children: [
              "$",
              c.total
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ComandaViewDialog, { comanda: c, size: "sm", variant: "ghost", label: "Detalle" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                type: "button",
                size: "sm",
                className: "h-9 gap-1 font-bold bg-[#2e7d32] hover:bg-[#1b5e20]",
                onClick: () => void entregar(c.id, c.folio),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
                  "Servido"
                ]
              }
            )
          ] })
        ]
      },
      c.id
    )) })
  ] }) });
}
function MeseroPasoCategoria({
  categorias,
  selectedCategoriaId,
  onSelectCategoria,
  mesa,
  cliente
}) {
  const clienteLabel = cliente?.trim();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MeseroStepHeader,
      {
        stepLabel: "Paso 3",
        title: "Elige el sabor",
        description: "Selecciona una categoría del menú Michelandia."
      }
    ),
    (mesa || clienteLabel) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 text-xs", children: [
      mesa && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0 text-slate-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: mesa.nombre })
      ] }),
      clienteLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3 shrink-0 text-slate-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold truncate max-w-[10rem]", children: clienteLabel })
      ] })
    ] }),
    categorias.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/90 text-center py-10 font-medium", children: "No hay categorías con productos disponibles." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 sm:gap-4", children: categorias.map((cat) => {
      const minPrice = Math.min(...cat.productos.map((p) => p.price), Infinity);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        FlavorGridCard,
        {
          themeId: cat.id,
          title: cat.name,
          subtitle: cat.description,
          minPrice: Number.isFinite(minPrice) ? minPrice : void 0,
          selected: selectedCategoriaId === cat.id,
          onSelect: () => onSelectCategoria(cat.id)
        },
        cat.id
      );
    }) })
  ] });
}
const TOUCH$5 = "touch-manipulation active:scale-[0.98] transition-all duration-150";
function MeseroPasoProducto({
  categoria,
  selectedProductId,
  onSelectProduct,
  onCambiarCategoria,
  onIrCategorias
}) {
  if (!categoria) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/90 font-medium", children: "Elige una categoría para ver productos." }),
      onIrCategorias && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "secondary",
          className: cn(TOUCH$5, "rounded-full bg-white/90"),
          onClick: onIrCategorias,
          children: "Ir a categorías"
        }
      )
    ] });
  }
  const productos = categoria.productos;
  const themeId = categoria.id;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        MeseroStepHeader,
        {
          stepLabel: "Paso 4",
          title: "Elige la base",
          description: `Productos de ${categoria.name}. Toca uno para continuar.`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: onCambiarCategoria,
          className: cn(
            TOUCH$5,
            "shrink-0 inline-flex items-center gap-1 text-xs font-bold text-white bg-black/20 hover:bg-black/30 rounded-full px-3 py-2 mt-1"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }),
            "Cambiar"
          ]
        }
      )
    ] }),
    productos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/90 text-center py-10 font-medium", children: "No hay productos en esta categoría." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemedPanel, { themeId, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ThemedPanelHeader,
        {
          themeId,
          title: categoria.name,
          subtitle: categoria.description
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-3 sm:px-4 sm:py-4 space-y-1", children: productos.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        MenuPriceRow,
        {
          label: productBaseLabel(p.name, categoria.name),
          price: p.price,
          selected: selectedProductId === p.id,
          onClick: () => onSelectProduct(p)
        },
        p.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onCambiarCategoria,
        className: "inline-flex items-center gap-2 text-sm font-bold text-white bg-black/20 hover:bg-black/30 rounded-full px-4 py-2 touch-manipulation",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Ver todos los sabores"
        ]
      }
    )
  ] });
}
const TOUCH$4 = "touch-manipulation active:scale-[0.98] transition-all duration-150";
function buildSuggestions(mesa) {
  const out = [];
  if (mesa?.cliente?.trim()) out.push(mesa.cliente.trim());
  if (mesa?.id === "llevar") {
    out.push("Para llevar");
    out.push("Mostrador");
  }
  return [...new Set(out)].slice(0, 4);
}
function MeseroPasoCliente({
  mesa,
  cliente,
  onClienteChange,
  onCambiarMesa
}) {
  const suggestions = reactExports.useMemo(() => buildSuggestions(mesa), [mesa]);
  const trimmed = cliente.trim();
  const maxLen = 40;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MeseroStepHeader,
      {
        stepLabel: "Paso 2",
        title: "Nombre del cliente",
        description: "¿Quién hace el pedido? Elige una sugerencia o escribe el nombre."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemedPanel, { themeId: "tradicional", children: [
      mesa && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-3 border-b border-dashed border-slate-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-slate-500 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wide text-slate-500 font-semibold", children: "Mesa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold truncate text-slate-800", children: mesa.nombre })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: onCambiarMesa,
            className: cn(
              TOUCH$4,
              "shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }),
              "Cambiar"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-4 sm:px-5 sm:py-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "cliente", className: "text-sm font-bold text-slate-800 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4 text-slate-500" }),
            "Cliente"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-slate-500 tabular-nums font-medium", children: [
            trimmed.length,
            "/",
            maxLen
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "cliente",
            value: cliente,
            onChange: (e) => onClienteChange(e.target.value),
            placeholder: "Ej. Juan, María…",
            maxLength: maxLen,
            autoFocus: true,
            autoComplete: "off",
            className: cn(
              "h-14 text-lg sm:text-base rounded-xl border-slate-300 bg-white",
              "focus-visible:ring-2 focus-visible:ring-[#1e88e5]/30"
            )
          }
        ),
        suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold uppercase tracking-wide text-slate-500", children: "Sugerencias" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: suggestions.map((name) => {
            const active = trimmed === name;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => onClienteChange(name),
                className: cn(
                  TOUCH$4,
                  "rounded-full border-2 px-3.5 py-2 text-sm font-semibold",
                  active ? "border-[#1e88e5] bg-[#1e88e5] text-white" : "border-slate-200 bg-white text-slate-800 hover:border-[#1e88e5]/50"
                ),
                children: name
              },
              name
            );
          }) })
        ] })
      ] })
    ] })
  ] });
}
const TOUCH$3 = "touch-manipulation active:scale-[0.98] transition-all duration-150";
function CartItemRow({
  item,
  productos,
  onRemove
}) {
  const tops = faseOpcionNames(item.micheladaId, item.selectedToppings, productos);
  const subtitle = orderItemSubtitle(item);
  const extras = [
    ...tops,
    ...item.additions.map((a) => a.price > 0 ? `${a.name} +${formatMenuPrice(a.price)}` : a.name)
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 px-4 py-3.5 first:pt-4 last:pb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3 items-baseline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-[15px] leading-snug tracking-tight truncate text-slate-900", children: item.micheladaName }),
          subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: subtitle })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[15px] font-extrabold tabular-nums shrink-0 text-slate-900", children: formatMenuPrice(item.total) })
      ] }),
      extras.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2", children: extras.join(" · ") }),
      item.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-700 mt-1.5 pl-2 border-l-2 border-amber-400 leading-relaxed line-clamp-2", children: item.notes })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "button",
        size: "icon",
        variant: "ghost",
        className: cn(TOUCH$3, "h-10 w-10 shrink-0 text-slate-500 hover:text-red-600"),
        onClick: onRemove,
        "aria-label": `Quitar ${item.micheladaName}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
      }
    )
  ] });
}
function MeseroPasoCarrito({
  cart,
  cartTotal,
  productos,
  mesa,
  cliente,
  onRemoveItem
}) {
  const clienteLabel = cliente?.trim();
  const count = cart.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MeseroStepHeader,
      {
        stepLabel: "Paso final",
        title: "Tu pedido",
        description: "Revisa los ítems y envía la comanda a barra cuando esté listo."
      }
    ),
    (mesa || clienteLabel) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 text-xs", children: [
      mesa && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0 text-slate-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: mesa.nombre })
      ] }),
      clienteLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3 shrink-0 text-slate-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold truncate max-w-[10rem]", children: clienteLabel })
      ] })
    ] }),
    count === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-dashed border-white/50 bg-white/20 px-4 py-14 text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-8 w-8 mx-auto text-white/70" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-white", children: "El pedido está vacío" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/85 max-w-[16rem] mx-auto leading-relaxed", children: "Agrega bebidas con el botón de abajo o vuelve atrás para armar un ítem." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemedPanel, { themeId: "adiciones", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemedPanelHeader, { themeId: "adiciones", title: "Resumen", subtitle: `${count} ítem${count === 1 ? "" : "s"}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-slate-100", children: [
        cart.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          CartItemRow,
          {
            item: it,
            productos,
            onRemove: () => onRemoveItem(it.id)
          },
          it.id
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-amber-50 px-4 py-3.5 flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-slate-600", children: "Total pedido" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black tabular-nums text-slate-900", children: formatMenuPrice(cartTotal) })
        ] })
      ] })
    ] })
  ] });
}
const TOUCH$2 = "touch-manipulation active:scale-[0.98] transition-all duration-150";
function MeseroPasoItem({
  michelada,
  toppingLabels,
  additions,
  notes,
  itemTotal,
  mesa,
  cliente,
  onAddToCart
}) {
  const clienteLabel = cliente?.trim();
  const extras = [
    ...toppingLabels,
    ...additions.map((a) => a.price > 0 ? `${a.name} +${formatMenuPrice(a.price)}` : a.name)
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MeseroStepHeader,
      {
        stepLabel: "Paso 6",
        title: "Confirmar ítem",
        description: "Revisa el detalle antes de agregarlo al pedido."
      }
    ),
    (mesa || clienteLabel) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 text-xs", children: [
      mesa && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0 text-slate-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: mesa.nombre })
      ] }),
      clienteLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3 shrink-0 text-slate-500" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold truncate max-w-[10rem]", children: clienteLabel })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemedPanel, { themeId: "especiales", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemedPanelHeader, { themeId: "especiales", title: michelada.name, subtitle: michelada.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-4 space-y-3", children: [
        extras.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600 leading-relaxed", children: extras.join(" · ") }),
        notes?.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-800 pl-3 border-l-2 border-amber-400 leading-relaxed", children: notes.trim() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 pt-2 border-t border-dashed border-slate-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-slate-600", children: "Total ítem" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-black tabular-nums text-slate-900", children: formatMenuPrice(itemTotal) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        type: "button",
        size: "lg",
        className: cn(
          TOUCH$2,
          "w-full h-14 rounded-xl text-base font-bold gap-2 bg-slate-900 hover:bg-slate-800 text-white"
        ),
        onClick: onAddToCart,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5" }),
          "Agregar al pedido"
        ]
      }
    )
  ] });
}
const TOUCH$1 = "touch-manipulation active:scale-[0.98] transition-all duration-150";
function MeseroPasoFase({
  faseName,
  productoName,
  opciones,
  selectedIds,
  onToggle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MeseroStepHeader,
      {
        title: faseName,
        description: `Elige opciones de ${faseName.toLowerCase()} para ${productoName}.`
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemedPanel, { themeId: "tradicional", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ThemedPanelHeader, { themeId: "tradicional", title: faseName, subtitle: productoName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 px-4 py-4 sm:px-5 sm:py-5", children: opciones.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600", children: "Sin opciones en esta fase." }) : opciones.map((op) => {
        const checked = selectedIds.includes(op.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => onToggle(op.id),
            className: cn(
              TOUCH$1,
              "px-4 py-3 min-h-11 rounded-full border-2 text-sm font-semibold",
              checked ? "bg-[#1e88e5] text-white border-[#1e88e5]" : "border-slate-200 bg-white text-slate-800 hover:border-[#1e88e5]/40"
            ),
            children: [
              checked ? "✓ " : "",
              op.name
            ]
          },
          op.id
        );
      }) })
    ] })
  ] });
}
const ACTIVA_STATUS = /* @__PURE__ */ new Set(["pendiente", "lista"]);
function isComandaActiva(c) {
  return ACTIVA_STATUS.has(c.status);
}
function getMesaActivity(mesaId, comandas) {
  const activas = comandas.filter((c) => c.mesaId === mesaId && isComandaActiva(c));
  return {
    activas,
    pendientes: activas.filter((c) => c.status === "pendiente").length,
    listas: activas.filter((c) => c.status === "lista").length,
    totalCuenta: activas.reduce((s, c) => s + c.total, 0)
  };
}
function getComandasListas(comandas) {
  return comandas.filter((c) => c.status === "lista");
}
const MESAS_SIN_LIBERAR = /* @__PURE__ */ new Set(["llevar"]);
function getMesasPorAtender(mesas, comandas, meseroId) {
  const idsConPedidos = /* @__PURE__ */ new Set();
  for (const c of comandas) {
    if (!c.mesaId || MESAS_SIN_LIBERAR.has(c.mesaId)) continue;
    if (!isComandaActiva(c)) continue;
    if (meseroId != null && c.meseroId != null && c.meseroId !== meseroId) continue;
    idsConPedidos.add(c.mesaId);
  }
  return mesas.filter((m) => {
    if (MESAS_SIN_LIBERAR.has(m.id)) return false;
    if (m.estado === "ocupada" || m.estado === "reservada") return true;
    return idsConPedidos.has(m.id);
  });
}
function MeseroMesasPorAtender({
  mesas,
  comandas,
  meseroId,
  onMarcarAtendida,
  onReloadComandas,
  className
}) {
  const [expanded, setExpanded] = reactExports.useState(true);
  const [loadingId, setLoadingId] = reactExports.useState(null);
  const porAtender = reactExports.useMemo(
    () => getMesasPorAtender(mesas, comandas, meseroId),
    [mesas, comandas, meseroId]
  );
  if (porAtender.length === 0) return null;
  async function atender(mesa) {
    const activity = getMesaActivity(mesa.id, comandas);
    if (activity.pendientes > 0) {
      const ok = window.confirm(
        `Mesa ${mesa.nombre} tiene ${activity.pendientes} pedido(s) aún en barra. ¿Marcar como atendida igual?`
      );
      if (!ok) return;
    }
    setLoadingId(mesa.id);
    try {
      await onMarcarAtendida(mesa.id);
      await onReloadComandas?.();
      toast.success(`${mesa.nombre} libre`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo liberar la mesa");
    } finally {
      setLoadingId(null);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn("rounded-xl border border-dashed bg-muted/30", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left",
        onClick: () => setExpanded((e) => !e),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium uppercase tracking-wide text-muted-foreground", children: [
            "Mesas en servicio · ",
            porAtender.length
          ] }),
          expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 text-muted-foreground shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground shrink-0" })
        ]
      }
    ),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "border-t divide-y divide-border/60 px-3 pb-2", children: porAtender.map((mesa) => {
      const activity = getMesaActivity(mesa.id, comandas);
      const ultima = activity.activas[0] ?? comandas.find((c) => c.mesaId === mesa.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "py-3 flex flex-col gap-2.5 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: mesa.nombre }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
            mesa.cliente ?? ultima?.cliente ?? "Sin nombre",
            activity.totalCuenta > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums", children: [
              " · $",
              activity.totalCuenta
            ] })
          ] }),
          activity.listas > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-emerald-600 dark:text-emerald-400 mt-0.5", children: [
            activity.listas,
            " listo",
            activity.listas === 1 ? "" : "s",
            " para servir"
          ] }),
          activity.pendientes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 dark:text-amber-400 mt-0.5", children: [
            activity.pendientes,
            " en barra"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
          ultima && activity.activas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ComandaViewDialog, { comanda: ultima, size: "sm", variant: "ghost", label: "Detalle" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              size: "sm",
              variant: "outline",
              className: "gap-1 h-9",
              disabled: loadingId === mesa.id,
              onClick: () => void atender(mesa),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
                loadingId === mesa.id ? "…" : "Atendida"
              ]
            }
          )
        ] })
      ] }, mesa.id);
    }) })
  ] });
}
const STATUS_BADGE = {
  pendiente: { label: "En barra", cls: "bg-amber-500/15 text-amber-800 dark:text-amber-200" },
  lista: { label: "¡Lista!", cls: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200" },
  entregada: { label: "Entregada", cls: "bg-muted text-muted-foreground" }
};
function MeseroMesaActividad({
  mesaId,
  mesaNombre,
  comandas,
  onNuevoPedido,
  onCerrar,
  onMarcarEntregada
}) {
  const activity = getMesaActivity(mesaId, comandas);
  async function entregar(c) {
    try {
      await onMarcarEntregada(c.id);
      toast.success(`Comanda #${c.folio} entregada`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-muted/20 p-4 sm:p-5 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-lg", children: mesaNombre }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          activity.activas.length,
          " pedido",
          activity.activas.length === 1 ? "" : "s",
          " activo",
          activity.activas.length === 1 ? "" : "s",
          " ",
          activity.totalCuenta > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
            " · $",
            activity.totalCuenta
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: onCerrar, children: "Cambiar mesa" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      activity.pendientes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-3 w-3" }),
        activity.pendientes,
        " en preparación"
      ] }),
      activity.listas > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "gap-1 bg-emerald-600 text-white hover:bg-emerald-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3 w-3" }),
        activity.listas,
        " para servir"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 max-h-[40vh] overflow-y-auto", children: activity.activas.map((c) => {
      const st = STATUS_BADGE[c.status];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: cn(
            "rounded-lg border bg-background px-3 py-2.5 flex flex-col gap-2",
            c.status === "lista" && "border-emerald-500/30"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-sm", children: [
                  "#",
                  c.folio,
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "·" }),
                  " ",
                  c.cliente
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground tabular-nums", children: [
                  c.items.length,
                  " ítem",
                  c.items.length === 1 ? "" : "s",
                  " · $",
                  c.total
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[11px] font-medium px-2 py-0.5 rounded-md", st.cls), children: st.label })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ComandaViewDialog, { comanda: c, size: "sm", variant: "ghost", label: "Detalle" }),
              c.status === "lista" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  type: "button",
                  size: "sm",
                  className: "gap-1 flex-1 min-w-[8rem]",
                  onClick: () => void entregar(c),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
                    "Marcar entregada"
                  ]
                }
              )
            ] })
          ]
        },
        c.id
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", className: "w-full gap-2 h-12", onClick: onNuevoPedido, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      "Agregar nuevo pedido"
    ] })
  ] });
}
function MesaCardActivityBadges({ activity }) {
  if (activity.activas.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] leading-tight", children: [
    activity.listas > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-emerald-600 dark:text-emerald-400", children: [
      activity.listas,
      " lista",
      activity.listas === 1 ? "" : "s"
    ] }),
    activity.pendientes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
      activity.listas > 0 ? "· " : "",
      activity.pendientes,
      " en barra"
    ] })
  ] });
}
const MESA_META = {
  libre: {
    label: "Libre",
    dot: "bg-emerald-500",
    border: "#43a047"
  },
  ocupada: {
    label: "Ocupada",
    dot: "bg-[#1e88e5]",
    border: "#1e88e5"
  },
  reservada: {
    label: "Reservada",
    dot: "bg-amber-500",
    border: "#f9a825"
  }
};
const TOUCH = "touch-manipulation active:scale-[0.98] transition-all duration-150";
function MesaTile({
  mesa,
  comandas,
  selected,
  onSelect
}) {
  const meta = MESA_META[mesa.estado];
  const activity = getMesaActivity(mesa.id, comandas);
  const hasLista = activity.listas > 0;
  const isSpecial = mesa.id === "llevar" || mesa.id === "barra";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: onSelect,
      className: cn(
        TOUCH,
        "relative w-full text-left rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 min-h-[5rem] shadow-lg",
        "flex flex-col justify-between gap-2",
        selected && "ring-2 ring-offset-2 ring-slate-900/25",
        hasLista && !selected && "bg-emerald-50",
        isSpecial && "min-h-[4.25rem]"
      ),
      style: {
        border: `3px solid ${meta.border}`,
        boxShadow: selected ? `0 8px 24px rgba(0,0,0,0.12)` : `0 6px 18px rgba(0,0,0,0.08)`
      },
      children: [
        hasLista && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 min-w-0 pr-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dot),
              "aria-hidden": true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-extrabold text-sm leading-tight tracking-tight text-slate-900", children: mesa.nombre }),
            mesa.capacidad > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-slate-500 mt-0.5 font-medium", children: [
              mesa.capacidad,
              " personas"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-2 pl-[18px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500 font-semibold uppercase", children: meta.label }),
            mesa.cliente && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold truncate mt-0.5 text-slate-800", children: mesa.cliente })
          ] }),
          activity.activas.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold tabular-nums text-slate-700 shrink-0", children: [
            "$",
            activity.totalCuenta
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-[18px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MesaCardActivityBadges, { activity }) })
      ]
    }
  );
}
function MeseroPasoMesa({
  mesas,
  comandas,
  meseroId,
  mesaId,
  mesaDetalleId,
  mesaDetalle,
  onSelectMesa,
  onCerrarDetalle,
  onNuevoPedido,
  onMarcarComandaEntregada,
  onMarcarMesaAtendida,
  onReloadComandas
}) {
  const { salon, otros } = reactExports.useMemo(() => {
    const special = /* @__PURE__ */ new Set(["llevar", "barra"]);
    return {
      salon: mesas.filter((m) => !special.has(m.id)),
      otros: mesas.filter((m) => special.has(m.id))
    };
  }, [mesas]);
  const counts = reactExports.useMemo(() => {
    let libre = 0;
    let ocupada = 0;
    let reservada = 0;
    for (const m of salon) {
      if (m.estado === "libre") libre++;
      else if (m.estado === "ocupada") ocupada++;
      else if (m.estado === "reservada") reservada++;
    }
    return { libre, ocupada, reservada };
  }, [salon]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MeseroStepHeader,
      {
        stepLabel: "Paso 1",
        title: "Elige la mesa",
        description: "Toca una mesa para tomar el pedido. Las ocupadas muestran la cuenta activa."
      }
    ),
    !mesaDetalleId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/90 font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-400" }),
        "Libre (",
        counts.libre,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-white" }),
        "Ocupada (",
        counts.ocupada,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-amber-300" }),
        "Reservada (",
        counts.reservada,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" }),
        "Lista para servir"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MeseroMesasPorAtender,
      {
        mesas,
        comandas,
        meseroId,
        onMarcarAtendida: onMarcarMesaAtendida,
        onReloadComandas
      }
    ),
    mesaDetalleId && mesaDetalle ? /* @__PURE__ */ jsxRuntimeExports.jsx(ThemedPanel, { themeId: "tradicional", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MeseroMesaActividad,
      {
        mesaId: mesaDetalleId,
        mesaNombre: mesaDetalle.nombre,
        comandas,
        onCerrar: onCerrarDetalle,
        onNuevoPedido: () => onNuevoPedido(mesaDetalleId),
        onMarcarEntregada: onMarcarComandaEntregada
      }
    ) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-wide", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Armchair, { className: "h-3.5 w-3.5" }),
          "Salón"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: salon.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          MesaTile,
          {
            mesa: m,
            comandas,
            selected: mesaId === m.id,
            onSelect: () => onSelectMesa(m.id)
          },
          m.id
        )) })
      ] }),
      otros.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-wide", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-3.5 w-3.5" }),
          "Para llevar y barra"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: otros.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          MesaTile,
          {
            mesa: m,
            comandas,
            selected: mesaId === m.id,
            onSelect: () => onSelectMesa(m.id)
          },
          m.id
        )) })
      ] })
    ] })
  ] });
}
function playListaChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => void ctx.close();
  } catch {
  }
}
function useMeseroComandaAlerts(comandas, enabled = true) {
  const prevStatusRef = reactExports.useRef(/* @__PURE__ */ new Map());
  const notifiedRef = reactExports.useRef(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    if (!enabled) return;
    for (const c of comandas) {
      const prev = prevStatusRef.current.get(c.id);
      prevStatusRef.current.set(c.id, c.status);
      if (c.status !== "lista") continue;
      if (prev === "lista" || notifiedRef.current.has(c.id)) continue;
      notifiedRef.current.add(c.id);
      const mesaLabel = c.mesa ? `Mesa ${c.mesa}` : "Sin mesa";
      toast.success(`¡Pedido listo! Comanda #${c.folio}`, {
        description: `${mesaLabel} · ${c.cliente}`,
        duration: 12e3
      });
      playListaChime();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([180, 80, 180]);
      }
    }
  }, [comandas, enabled]);
}
const MESERO_STEP_LABELS = {
  mesa: "Elegir mesa",
  cliente: "Cliente",
  categoria: "Categoría",
  producto: "Producto",
  adiciones: "Adiciones",
  notas: "Notas",
  item: "Confirmar ítem",
  carrito: "Enviar pedido"
};
function getMeseroStepLabel(step, fases) {
  const faseId = parseFaseIdFromPaso(step);
  if (faseId) {
    return fases.find((f) => f.id === faseId)?.name ?? faseId;
  }
  return MESERO_STEP_LABELS[step] ?? step;
}
function buildMeseroSteps(pasos, michelada, faseIds) {
  const ids = faseIds ?? [];
  const configured = normalizeProductPasos(pasos, ids);
  const flow = ["mesa", "cliente", "categoria", "producto"];
  for (const p of configured) {
    if (p === PASO_NOTAS) {
      flow.push("notas");
      continue;
    }
    if (isFasePaso(p)) {
      const faseId = parseFaseIdFromPaso(p);
      const count = michelada?.faseOpciones.filter((o) => o.faseId === faseId).length ?? 0;
      if (count > 0) flow.push(fasePasoId(faseId));
    }
  }
  flow.push("adiciones", "item", "carrito");
  return flow;
}
const TOUCH_BTN = "touch-manipulation active:scale-[0.98] transition-transform min-h-[3rem]";
function MeseroOrderWizard() {
  const { categorias, productos, adiciones, fases, faseOpciones, loading: menuLoading } = useMenu();
  const { comandas, addComanda, updateStatus, reload: reloadComandas } = useComandas();
  const { decrementBatch, reload: reloadInventario } = useInventory();
  const { mesas, loading: mesasLoading, reload: reloadMesas, marcarAtendida } = useMesas();
  const meseroId = getStoredSession()?.user.id;
  useMeseroComandaAlerts(comandas);
  const [currentStep, setCurrentStep] = reactExports.useState("mesa");
  const [mesaDetalleId, setMesaDetalleId] = reactExports.useState(null);
  const [cliente, setCliente] = reactExports.useState("");
  const [mesaId, setMesaId] = reactExports.useState("");
  const [selectedCategoriaId, setSelectedCategoriaId] = reactExports.useState("");
  const [selectedId, setSelectedId] = reactExports.useState("");
  const [toppings, setToppings] = reactExports.useState([]);
  const [additionIds, setAdditionIds] = reactExports.useState([]);
  const [notes, setNotes] = reactExports.useState("");
  const [cart, setCart] = reactExports.useState([]);
  const [sending, setSending] = reactExports.useState(false);
  const categoriasActivas = reactExports.useMemo(
    () => categorias.filter((c) => c.activo !== false && c.productos.length > 0),
    [categorias]
  );
  const categoriaSeleccionada = categoriasActivas.find((c) => c.id === selectedCategoriaId);
  const michelada = productos.find((m) => m.id === selectedId);
  const faseIds = reactExports.useMemo(() => fases.map((f) => f.id), [fases]);
  const steps = reactExports.useMemo(
    () => buildMeseroSteps(michelada?.pasos, michelada, faseIds),
    [michelada, faseIds]
  );
  const stepIndex = Math.max(0, steps.indexOf(currentStep));
  const step = steps[stepIndex] ?? currentStep;
  const progress = (stepIndex + 1) / steps.length * 100;
  const selectedAdditions = reactExports.useMemo(
    () => adiciones.filter((a) => additionIds.includes(a.id)).map(({ id, name, price }) => ({ id, name, price })),
    [adiciones, additionIds]
  );
  const itemTotal = michelada ? calcItemTotal(michelada.price, selectedAdditions) : 0;
  const cartTotal = cart.reduce((s, i) => s + i.total, 0);
  const mesaSeleccionada = mesas.find((m) => m.id === mesaId);
  const comandasListas = reactExports.useMemo(() => getComandasListas(comandas), [comandas]);
  const mesaDetalle = mesas.find((m) => m.id === mesaDetalleId);
  function continueToCliente(id) {
    const mesa = mesas.find((m) => m.id === id);
    setMesaId(id);
    setMesaDetalleId(null);
    if (mesa?.cliente) setCliente(mesa.cliente);
    else if (id === "llevar") setCliente((c) => c || "Para llevar");
    setCurrentStep("cliente");
  }
  function selectMesa(id) {
    const activity = getMesaActivity(id, comandas);
    setMesaId(id);
    if (activity.activas.length > 0) {
      setMesaDetalleId(id);
      return;
    }
    continueToCliente(id);
  }
  function goNext() {
    const idx = steps.indexOf(currentStep);
    if (idx >= 0 && idx < steps.length - 1) setCurrentStep(steps[idx + 1]);
  }
  function goBack() {
    const idx = steps.indexOf(currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1]);
  }
  function resetItemBuilder() {
    setToppings([]);
    setAdditionIds([]);
    setNotes("");
  }
  function selectCategoria(id) {
    setSelectedCategoriaId(id);
    setSelectedId("");
    setCurrentStep("producto");
  }
  function startNewItem() {
    resetItemBuilder();
    setSelectedId("");
    setSelectedCategoriaId("");
    setCurrentStep("categoria");
  }
  function addToCart() {
    if (!michelada) return;
    const item = {
      id: crypto.randomUUID(),
      micheladaId: michelada.id,
      micheladaName: michelada.name,
      basePrice: michelada.price,
      selectedToppings: [...toppings],
      additions: selectedAdditions,
      notes: notes.trim() || void 0,
      total: itemTotal
    };
    setCart((c) => [...c, item]);
    resetItemBuilder();
    setSelectedId("");
    toast.success(`${michelada.name} agregada`);
    setCurrentStep("carrito");
  }
  async function sendOrder() {
    if (cart.length === 0) {
      toast.error("Agrega al menos una michelada");
      return;
    }
    const nombre = cliente.trim() || "Cliente";
    const mesa = mesaSeleccionada?.nombre;
    setSending(true);
    try {
      const pendingBefore = getPendingCount();
      const c = await addComanda({
        cliente: nombre,
        mesaId: mesaId || void 0,
        mesa,
        items: cart,
        total: cartTotal
      });
      const queued = getPendingCount() > pendingBefore;
      if (!getStoredSession() || !isAppOnline() || queued) {
        decrementBatch(buildOrderDeductions(cart, adiciones, productos, faseOpciones));
      } else {
        void reloadInventario();
      }
      printComandaOnSend(c, productos);
      toast.success(
        queued ? `Turno ${c.queueOrder} · Comanda #${c.folio} guardada localmente. Ticket impreso.` : `Turno ${c.queueOrder} · Comanda #${c.folio} enviada. Ticket impreso.`
      );
      void reloadMesas();
      setCart([]);
      setCliente("");
      setMesaId("");
      setMesaDetalleId(null);
      setCurrentStep("mesa");
      resetItemBuilder();
      setSelectedId("");
      setSelectedCategoriaId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar el pedido");
    } finally {
      setSending(false);
    }
  }
  function canContinue() {
    switch (step) {
      case "mesa":
        return mesaId.length > 0;
      case "cliente":
        return cliente.trim().length > 0;
      case "categoria":
        return selectedCategoriaId.length > 0;
      case "producto":
        return !!selectedId;
      case "adiciones":
        return true;
      case "notas":
        return true;
      case "item":
        return !!michelada;
      case "carrito":
        return cart.length > 0;
      default:
        return isFasePaso(step);
    }
  }
  if (menuLoading || mesasLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-10 w-10 animate-spin text-white" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/90 font-medium", children: "Cargando menú…" })
    ] });
  }
  if (productos.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white/90 p-8 text-center text-slate-600 font-medium shadow-lg", children: "No hay productos en el menú. Pide al administrador que configure el menú." });
  }
  const showNavFooter = step !== "carrito";
  const showCartFooter = step === "carrito";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky z-20 top-0 -mx-3 px-3 pt-1 pb-3 sm:mx-0 sm:px-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-black/15 backdrop-blur-sm p-3 border border-white/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-sm mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-white/90 tabular-nums", children: [
            "Paso ",
            stepIndex + 1,
            "/",
            steps.length
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-white truncate max-w-[55%] text-right", children: getMeseroStepLabel(step, fases) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress, className: "h-2.5 rounded-full bg-white/25 [&>div]:bg-[#ffcc00]" })
      ] }),
      comandasListas.length > 0 && step !== "carrito" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MeseroListasBanner,
        {
          listas: comandasListas,
          onMarcarEntregada: (id) => updateStatus(id, "entregada"),
          className: "mt-3"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "space-y-3 sm:space-y-4 pt-3",
          (showNavFooter || showCartFooter) && "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]",
          showCartFooter && cart.length > 0 && "pb-[calc(12rem+env(safe-area-inset-bottom,0px))]"
        ),
        children: [
          step === "mesa" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            MeseroPasoMesa,
            {
              mesas,
              comandas,
              meseroId,
              mesaId,
              mesaDetalleId,
              mesaDetalle,
              onSelectMesa: selectMesa,
              onCerrarDetalle: () => {
                setMesaDetalleId(null);
                setMesaId("");
              },
              onNuevoPedido: continueToCliente,
              onMarcarComandaEntregada: (id) => updateStatus(id, "entregada"),
              onMarcarMesaAtendida: marcarAtendida,
              onReloadComandas: reloadComandas
            }
          ),
          step === "cliente" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            MeseroPasoCliente,
            {
              mesa: mesaSeleccionada,
              cliente,
              onClienteChange: setCliente,
              onCambiarMesa: () => setCurrentStep("mesa")
            }
          ),
          step === "categoria" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            MeseroPasoCategoria,
            {
              categorias: categoriasActivas,
              selectedCategoriaId,
              onSelectCategoria: selectCategoria,
              mesa: mesaSeleccionada,
              cliente
            }
          ),
          step === "producto" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            MeseroPasoProducto,
            {
              categoria: categoriaSeleccionada,
              selectedProductId: selectedId,
              onSelectProduct: (m) => {
                setSelectedId(m.id);
                setToppings([]);
                setAdditionIds([]);
                setNotes("");
                const next = buildMeseroSteps(m.pasos, m, faseIds);
                const idx = next.indexOf("producto");
                if (idx >= 0 && idx < next.length - 1) setCurrentStep(next[idx + 1]);
              },
              onCambiarCategoria: () => {
                setSelectedCategoriaId("");
                setSelectedId("");
                setCurrentStep("categoria");
              },
              onIrCategorias: () => setCurrentStep("categoria")
            }
          ),
          isFasePaso(step) && michelada && (() => {
            const faseId = parseFaseIdFromPaso(step);
            const faseName = fases.find((f) => f.id === faseId)?.name ?? faseId;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              MeseroPasoFase,
              {
                faseName,
                productoName: michelada.name,
                opciones: opcionesForFase(michelada, faseId),
                selectedIds: toppings,
                onToggle: (id) => setToppings(
                  (cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
                )
              }
            );
          })(),
          step === "adiciones" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MeseroStepHeader,
              {
                title: "Adiciones",
                description: "Extras opcionales para la michelada."
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemedPanel, { themeId: "adiciones", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ThemedPanelHeader, { themeId: "adiciones", title: "Adiciones", subtitle: "Extras para tu michelada" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2 py-2 sm:px-3 sm:py-3 space-y-1", children: [
                adiciones.map((a) => {
                  const checked = additionIds.includes(a.id);
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MenuPriceRow,
                    {
                      label: checked ? `✓ ${a.name}` : a.name,
                      price: a.price,
                      selected: checked,
                      onClick: () => setAdditionIds(
                        (cur) => cur.includes(a.id) ? cur.filter((x) => x !== a.id) : [...cur, a.id]
                      )
                    },
                    a.id
                  );
                }),
                adiciones.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-600 text-center py-6", children: "Sin adiciones" })
              ] })
            ] })
          ] }),
          step === "notas" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              MeseroStepHeader,
              {
                title: "Notas para barra",
                description: "Instrucciones especiales (opcional)."
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ThemedPanel, { themeId: "tradicional", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-4 sm:px-5 sm:py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: notes,
                onChange: (e) => setNotes(e.target.value),
                placeholder: "Sin hielo, extra picante… (opcional)",
                maxLength: 200,
                rows: 4,
                className: "min-h-[120px] text-base sm:text-sm rounded-xl border-slate-300 bg-white"
              }
            ) }) })
          ] }),
          step === "item" && michelada && /* @__PURE__ */ jsxRuntimeExports.jsx(
            MeseroPasoItem,
            {
              michelada,
              toppingLabels: faseOpcionNames(michelada.id, toppings, productos),
              additions: selectedAdditions,
              notes,
              itemTotal,
              mesa: mesaSeleccionada,
              cliente,
              onAddToCart: addToCart
            }
          ),
          step === "carrito" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            MeseroPasoCarrito,
            {
              cart,
              cartTotal,
              productos,
              mesa: mesaSeleccionada,
              cliente,
              onRemoveItem: (id) => setCart((c) => c.filter((x) => x.id !== id))
            }
          )
        ]
      }
    ),
    showNavFooter && /* @__PURE__ */ jsxRuntimeExports.jsx(MichelandiaFooterBar, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      stepIndex > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          variant: "outline",
          className: cn(
            "flex-1 gap-1.5 h-12 text-base font-bold border-slate-800/20 bg-white/80",
            TOUCH_BTN
          ),
          onClick: goBack,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }),
            "Atrás"
          ]
        }
      ),
      step !== "item" && step !== "mesa" && step !== "categoria" && !isFasePaso(step) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          className: cn(
            "flex-1 gap-1.5 h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white",
            TOUCH_BTN,
            stepIndex === 0 && "flex-1"
          ),
          onClick: goNext,
          disabled: !canContinue(),
          children: [
            "Siguiente",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-5 w-5" })
          ]
        }
      ),
      step === "item" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          className: cn("flex-1 h-12 text-base font-bold border-slate-800/20 bg-white/80", TOUCH_BTN),
          onClick: goBack,
          children: "Atrás"
        }
      )
    ] }) }),
    showCartFooter && /* @__PURE__ */ jsxRuntimeExports.jsx(MichelandiaFooterBar, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          className: cn("w-full gap-2 h-11 rounded-xl font-bold border-slate-800/20 bg-white/80", TOUCH_BTN),
          onClick: startNewItem,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "Agregar otra bebida"
          ]
        }
      ),
      cart.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ComandaViewDialog,
        {
          comanda: {
            id: "preview",
            folio: 0,
            queueOrder: 0,
            cliente: cliente.trim() || "Cliente",
            mesa: mesaSeleccionada?.nombre,
            items: cart,
            total: cartTotal,
            createdAt: Date.now(),
            status: "pendiente"
          },
          size: "default",
          variant: "outline",
          className: cn("w-full h-11 rounded-xl font-bold border-slate-800/20 bg-white/80", TOUCH_BTN),
          label: "Vista previa"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          size: "lg",
          className: cn(
            "w-full gap-2 h-14 rounded-xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-white",
            TOUCH_BTN
          ),
          onClick: () => void sendOrder(),
          disabled: cart.length === 0 || sending,
          children: [
            sending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-5 w-5" }),
            sending ? "Enviando…" : "Enviar a barra"
          ]
        }
      )
    ] }) })
  ] });
}
const TAB_ACCESS = {
  pedido: ["mesero"],
  mesas: [],
  comandas: [],
  inventario: []
};
function tabsForRole(rol) {
  return Object.keys(TAB_ACCESS).filter((tab) => TAB_ACCESS[tab].includes(rol));
}
function defaultTabForRole(rol) {
  const tabs = tabsForRole(rol);
  return tabs[0] ?? "pedido";
}
const TAB_META = {
  pedido: {
    label: "Pedido",
    icon: Beer
  },
  mesas: {
    label: "Mesas",
    icon: Users
  },
  comandas: {
    label: "Comandas",
    icon: ClipboardList
  },
  inventario: {
    label: "Inventario",
    icon: Boxes
  }
};
function Index() {
  const {
    user
  } = Route.useRouteContext();
  const navigate = useNavigate();
  const allowedTabs = tabsForRole(user.rol);
  const [activeTab, setActiveTab] = reactExports.useState(defaultTabForRole(user.rol));
  function handleLogout() {
    clearSession();
    void navigate({
      to: "/login"
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen min-h-[100dvh] relative flex flex-col text-slate-900", style: {
    fontFamily: '"Poppins", system-ui, sans-serif'
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MichelandiaBackground, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col min-h-screen min-h-[100dvh]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PosHeader, { brand: "Michelandia", title: "Mesero", variant: "michelandia", userName: user.nombre, roleLabel: ROL_LABELS[user.rol], onLogout: handleLogout }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 mx-auto w-full max-w-lg px-3 pt-3 pb-4 sm:px-4", children: allowedTabs.length === 1 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        allowedTabs[0] === "pedido" && /* @__PURE__ */ jsxRuntimeExports.jsx(MeseroOrderWizard, {}),
        allowedTabs[0] === "inventario" && /* @__PURE__ */ jsxRuntimeExports.jsx(InventoryPanel, {})
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: activeTab, onValueChange: (v) => setActiveTab(v), className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsList, { className: "grid w-full max-w-xl", style: {
          gridTemplateColumns: `repeat(${allowedTabs.length}, minmax(0, 1fr))`
        }, children: allowedTabs.map((tab) => {
          const meta = TAB_META[tab];
          const Icon = meta.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: tab, className: "gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
            " ",
            meta.label
          ] }, tab);
        }) }),
        allowedTabs.includes("pedido") && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pedido", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MeseroOrderWizard, {}) }),
        allowedTabs.includes("inventario") && /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "inventario", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(InventoryPanel, {}) })
      ] }) })
    ] })
  ] }) });
}
export {
  Index as component
};
