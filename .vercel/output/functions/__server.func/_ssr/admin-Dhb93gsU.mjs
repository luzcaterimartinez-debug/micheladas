import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { T as Toaster, t as toast } from "../_libs/sonner.mjs";
import { C as Card, d as CardHeader, e as CardTitle, f as CardContent, h as CardDescription, B as Badge, D as Dialog, i as DialogContent, j as DialogHeader, k as DialogTitle, l as DialogFooter, S as Separator, g as ComandaViewDialog, T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-B8LtigXh.mjs";
import { K as Route$1, c as cn, a as clearSession, u as useComandas, f as useInventory, j as useMesas, k as fetchMenuAdmin, m as fetchInventario, t as fetchFasesAdmin, E as getStoredSession, H as ROL_LABELS, d as sortComandasByQueue, q as queueLabel, J as calcItemTotal, A as createCategoria, B as updateCategoria, C as createProducto, D as updateProducto, v as createFase, w as updateFase, x as createFaseOpcion, y as updateFaseOpcion, z as deleteFaseOpcion, o as createAdicion, p as updateAdicion, r as deleteAdicion, b as getApiUrl, G as parseApiError, I as mapComanda } from "./router-Cug9C9eT.mjs";
import { B as Button } from "./button-CHqgX7FO.mjs";
import { I as InventoryPanel, T as Textarea, i as isFasePaso, p as parseFaseIdFromPaso, f as fasePasoId, P as PASO_NOTAS, A as AlertDialog, a as AlertDialogContent, b as AlertDialogHeader, c as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction, n as normalizeProductPasos, j as buildOrderDeductions } from "./inventory-deduction-8RikRdDC.mjs";
import { L as Label, I as Input } from "./label-CJj8aDw5.mjs";
import { R as Root2, V as Value, T as Trigger, I as Icon, P as Portal$1, C as Content2, a as Viewport, b as Item, c as ItemIndicator, d as ItemText, S as ScrollUpButton, e as ScrollDownButton, L as Label$1, f as Separator$1 } from "../_libs/radix-ui__react-select.mjs";
import { S as Switch } from "./switch-yG2h9IN0.mjs";
import { C as Checkbox$1, a as CheckboxIndicator } from "../_libs/radix-ui__react-checkbox.mjs";
import { R as Root, P as Portal, C as Content, a as Close, T as Title, O as Overlay, D as Description } from "../_libs/radix-ui__react-dialog.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { M as MenuProvider, u as useMenu, f as faseOpcionNames, p as printComanda, b as printComandaOnSend } from "./menu-context-CKCt_eqj.mjs";
import { R as Root$1, V as Viewport$1, C as Corner, S as ScrollAreaScrollbar, a as ScrollAreaThumb } from "../_libs/radix-ui__react-scroll-area.mjs";
import { h as Beer, i as LayoutDashboard, j as LayoutGrid, k as BookOpen, l as Layers, m as ListPlus, U as UserCog, n as ClipboardList, o as Banknote, p as ChartColumn, q as Wallet, r as Boxes, s as Users, t as UtensilsCrossed, b as LogOut, M as Menu, D as DollarSign, e as Package, T as TriangleAlert, L as LoaderCircle, u as Plus, v as Pencil, w as ChevronRight, A as ArrowLeft, x as Trash2, y as UserPlus, f as Check, d as Clock, g as Printer, R as RefreshCw, z as CircleCheck, E as Undo2, F as Calculator, G as CreditCard, H as Calendar, I as HandCoins, J as Move, K as ShoppingCart, X, N as ChevronDown, O as ChevronUp } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-separator.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-switch.mjs";
function isToday(ts) {
  const d = new Date(ts);
  const now = /* @__PURE__ */ new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}
function AdminDashboard() {
  const { comandas } = useComandas();
  const { items } = useInventory();
  const { mesas } = useMesas();
  const hoy = comandas.filter((c) => isToday(c.createdAt));
  const ventasHoy = hoy.reduce((s, c) => s + c.total, 0);
  const pendientes = comandas.filter((c) => c.status === "pendiente").length;
  const listas = comandas.filter((c) => c.status === "lista").length;
  const inventarioBajo = items.filter((i) => i.stock <= (i.minStock ?? 5)).length;
  const mesasOcupadas = mesas.filter((m) => m.estado === "ocupada").length;
  const stats = [
    {
      title: "Ventas hoy",
      value: `$${ventasHoy.toLocaleString("es-MX")}`,
      sub: `${hoy.length} comandas`,
      icon: DollarSign
    },
    {
      title: "Pendientes",
      value: String(pendientes),
      sub: "por preparar",
      icon: ClipboardList
    },
    {
      title: "Listas",
      value: String(listas),
      sub: "por entregar",
      icon: Package
    },
    {
      title: "Mesas ocupadas",
      value: `${mesasOcupadas}/${mesas.length}`,
      sub: "capacidad en uso",
      icon: Users
    },
    {
      title: "Inventario bajo",
      value: String(inventarioBajo),
      sub: "productos ≤ 5 u.",
      icon: TriangleAlert,
      alert: inventarioBajo > 0
    }
  ];
  const recientes = comandas.slice(0, 8);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Resumen del día" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Vista general de operación e inventario" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", children: stats.map((s) => {
      const Icon2 = s.icon;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: s.alert ? "border-destructive/50" : "", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: s.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: `h-4 w-4 ${s.alert ? "text-destructive" : "text-muted-foreground"}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: s.value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: s.sub })
        ] })
      ] }, s.title);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Comandas recientes" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: recientes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-4 text-center", children: "Sin actividad registrada" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-2", children: recientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-xl border p-3 flex items-start justify-between gap-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-sm", children: [
                  "#",
                  c.folio,
                  " · ",
                  c.cliente
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                  c.mesa ? `Mesa ${c.mesa}` : "Sin mesa",
                  " ·",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: c.status })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold text-sm tabular-nums shrink-0", children: [
                "$",
                c.total
              ] })
            ]
          },
          c.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-4", children: "Folio" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-4", children: "Cliente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-4", children: "Mesa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-4", children: "Estado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-right", children: "Total" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: recientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-4 font-medium", children: [
              "#",
              c.folio
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: c.cliente }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 text-muted-foreground", children: c.mesa ?? "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 capitalize", children: c.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right font-medium", children: [
              "$",
              c.total
            ] })
          ] }, c.id)) })
        ] }) })
      ] }) })
    ] })
  ] });
}
const Select = Root2;
const SelectValue = Value;
const SelectTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = Trigger.displayName;
const SelectScrollUpButton = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = ScrollUpButton.displayName;
const SelectScrollDownButton = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = ScrollDownButton.displayName;
const SelectContent = reactExports.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Content2,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = Content2.displayName;
const SelectLabel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label$1,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = Label$1.displayName;
const SelectItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ItemText, { children })
    ]
  }
));
SelectItem.displayName = Item.displayName;
const SelectSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator$1,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = Separator$1.displayName;
function findInventarioItem(items, key) {
  if (!key) return void 0;
  return items.find((i) => i.key === key);
}
function formatCantidadInventario(cantidad, unit) {
  const n = Number(cantidad);
  const shown = Number.isInteger(n) ? String(n) : String(n);
  return unit ? `${shown} ${unit}` : shown;
}
function inventarioSelectLabel(item) {
  return `${item.name} — ${item.stock} ${item.unit}`;
}
function parseCantidadInventario(stockKey, value) {
  if (!stockKey?.trim()) {
    return { ok: true, cantidad: 1 };
  }
  const n = Number(value.trim());
  if (!Number.isFinite(n) || n <= 0) {
    return {
      ok: false,
      message: "Escribe cuánto lleva en la unidad del inventario (ej. 50 g, 0.05 L, 1 pz)."
    };
  }
  return { ok: true, cantidad: n };
}
const UNIT_PLACEHOLDER = {
  g: "50",
  L: "0.05",
  pz: "1"
};
function cantidadPlaceholder(unit) {
  if (!unit) return "1";
  return UNIT_PLACEHOLDER[unit] ?? "1";
}
function CantidadInventarioField({
  inventario,
  stockKey,
  value,
  onChange,
  disabled
}) {
  const item = findInventarioItem(inventario, stockKey);
  const unit = item?.unit ?? "";
  const parsed = Number(value);
  const hasQty = Number.isFinite(parsed) && parsed > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cantidad que lleva" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          min: 1e-3,
          step: "any",
          className: "flex-1",
          value,
          onChange: (e) => onChange(e.target.value),
          disabled: disabled || !stockKey,
          placeholder: cantidadPlaceholder(unit)
        }
      ),
      unit ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground w-10 shrink-0", children: unit }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground w-10 shrink-0", children: "—" })
    ] }),
    !stockKey ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Elige un ítem de inventario para indicar cuánto se resta al vender." }) : item ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
      "En inventario hay ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: item.stock }),
      " ",
      unit,
      ".",
      hasQty ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        " ",
        "Al vender se restará",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: formatCantidadInventario(parsed, unit) }),
        item.stock - parsed >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " (quedarían ",
          item.stock - parsed,
          " ",
          unit,
          ")"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: " — no alcanza el stock actual" }),
        "."
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        " Escribe el gasto por pedido en ",
        unit,
        " (misma unidad que en Inventario)."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Usa la misma unidad que el ítem en Inventario (g, L, pz)." })
  ] });
}
function AdminAdiciones() {
  const [adiciones, setAdiciones] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [dialog, setDialog] = reactExports.useState(null);
  const [editId, setEditId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    nombre: "",
    precio: "",
    stock_key: "",
    cantidad: "",
    activo: true
  });
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const [inventarioKeys, setInventarioKeys] = reactExports.useState([]);
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const menu = await fetchMenuAdmin();
      setAdiciones(menu.adiciones);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar adiciones");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void load();
  }, [load]);
  reactExports.useEffect(() => {
    fetchInventario().then(setInventarioKeys).catch(() => setInventarioKeys([]));
  }, []);
  function openCreate() {
    setDialog("create");
    setEditId(null);
    setForm({ nombre: "", precio: "", stock_key: "", cantidad: "", activo: true });
  }
  function openEdit(a) {
    setDialog("edit");
    setEditId(a.id);
    setForm({
      nombre: a.name,
      precio: String(a.price),
      stock_key: a.stockKey ?? "",
      cantidad: String(a.cantidad ?? 1),
      activo: a.activo !== false
    });
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteAdicion(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" eliminada`);
      if (editId === deleteTarget.id) {
        setDialog(null);
        setEditId(null);
      }
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }
  async function save() {
    if (!form.nombre.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    const stockKey = form.stock_key.trim() || void 0;
    const parsedQty = parseCantidadInventario(stockKey, form.cantidad);
    if (!parsedQty.ok) {
      toast.error(parsedQty.message);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        stock_key: stockKey,
        cantidad: parsedQty.cantidad,
        activo: form.activo
      };
      if (dialog === "create") {
        await createAdicion(payload);
        toast.success("Adición creada");
      } else if (editId) {
        await updateAdicion(editId, payload);
        toast.success("Adición actualizada");
      }
      setDialog(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListPlus, { className: "h-5 w-5 text-muted-foreground" }),
        "Adiciones globales"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: 'Extras que el mesero puede agregar a cualquier producto (paso "Adiciones" del pedido). Indica el ítem de inventario y cuánto lleva (misma unidad: g, L, pz); al vender se resta esa cantidad del stock.' })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Listado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            adiciones.length,
            " adición",
            adiciones.length === 1 ? "" : "es",
            " disponibles"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Nueva adición"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: adiciones.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "No hay adiciones. Crea la primera para ofrecer extras en el pedido." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: adiciones.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-4 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold leading-tight", children: a.name }),
            !a.activo && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-1 text-xs", children: "Oculta" }),
            a.stockKey && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground mt-1", children: [
              "Descuenta",
              " ",
              formatCantidadInventario(
                a.cantidad ?? 1,
                findInventarioItem(inventarioKeys, a.stockKey)?.unit ?? ""
              ),
              " ",
              "de ",
              a.stockKey
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "shrink-0 tabular-nums", children: [
            "+$",
            a.price
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "gap-1",
              onClick: () => openEdit(a),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
                "Editar"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "gap-1 text-destructive hover:text-destructive hover:bg-destructive/10",
              onClick: () => setDeleteTarget({ id: a.id, name: a.name }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
                "Eliminar"
              ]
            }
          )
        ] })
      ] }, a.id)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialog !== null, onOpenChange: (o) => !o && setDialog(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dialog === "create" ? "Nueva adición" : "Editar adición" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.nombre,
              onChange: (e) => setForm((f) => ({ ...f, nombre: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Precio ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              value: form.precio,
              onChange: (e) => setForm((f) => ({ ...f, precio: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inventario (clave)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.stock_key || "__none__",
              onValueChange: (v) => setForm((f) => ({ ...f, stock_key: v === "__none__" ? "" : v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sin descuento de stock" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Sin vínculo" }),
                  inventarioKeys.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: i.key, children: inventarioSelectLabel(i) }, i.key))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CantidadInventarioField,
          {
            inventario: inventarioKeys,
            stockKey: form.stock_key,
            value: form.cantidad,
            onChange: (cantidad) => setForm((f) => ({ ...f, cantidad }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Visible en menú" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: form.activo,
              onCheckedChange: (activo) => setForm((f) => ({ ...f, activo }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-col-reverse sm:flex-row sm:justify-between gap-2", children: [
        dialog === "edit" && editId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "destructive",
            className: "sm:mr-auto",
            disabled: saving,
            onClick: () => setDeleteTarget({
              id: editId,
              name: form.nombre.trim() || adiciones.find((a) => a.id === editId)?.name || ""
            }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-1" }),
              "Eliminar"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 sm:ml-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDialog(null), children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void save(), disabled: saving, children: "Guardar" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: deleteTarget !== null,
        onOpenChange: (open) => !open && setDeleteTarget(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "¿Eliminar adición?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "Se quitará ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget?.name }),
              " del menú. Las comandas ya enviadas conservan el historial con ese nombre. Esta acción no se puede deshacer."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: saving, children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                disabled: saving,
                onClick: (e) => {
                  e.preventDefault();
                  void confirmDelete();
                },
                children: "Eliminar"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function AdminFases() {
  const [fases2, setFases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [faseDialog, setFaseDialog] = reactExports.useState(null);
  const [editFaseId, setEditFaseId] = reactExports.useState(null);
  const [faseForm, setFaseForm] = reactExports.useState({ nombre: "", descripcion: "", activo: true });
  const [opcionDialog, setOpcionDialog] = reactExports.useState(
    null
  );
  const [editOpcionId, setEditOpcionId] = reactExports.useState(null);
  const [opcionNombre, setOpcionNombre] = reactExports.useState("");
  const [opcionStockKey, setOpcionStockKey] = reactExports.useState("");
  const [opcionCantidad, setOpcionCantidad] = reactExports.useState("");
  const [inventarioKeys, setInventarioKeys] = reactExports.useState([]);
  const [deleteOpcion, setDeleteOpcion] = reactExports.useState(null);
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      setFases(await fetchFasesAdmin());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar fases");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void load();
  }, [load]);
  reactExports.useEffect(() => {
    fetchInventario().then(setInventarioKeys).catch(() => setInventarioKeys([]));
  }, []);
  function openCreateFase() {
    setFaseDialog("create");
    setEditFaseId(null);
    setFaseForm({ nombre: "", descripcion: "", activo: true });
  }
  function openEditFase(f) {
    setFaseDialog("edit");
    setEditFaseId(f.id);
    setFaseForm({
      nombre: f.name,
      descripcion: f.description ?? "",
      activo: f.activo !== false
    });
  }
  async function saveFase() {
    if (!faseForm.nombre.trim()) {
      toast.error("Nombre de fase requerido");
      return;
    }
    setSaving(true);
    try {
      if (faseDialog === "create") {
        await createFase({
          nombre: faseForm.nombre.trim(),
          descripcion: faseForm.descripcion.trim(),
          activo: faseForm.activo
        });
        toast.success("Fase creada");
      } else if (editFaseId) {
        await updateFase(editFaseId, {
          nombre: faseForm.nombre.trim(),
          descripcion: faseForm.descripcion.trim(),
          activo: faseForm.activo
        });
        toast.success("Fase actualizada");
      }
      setFaseDialog(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }
  function openCreateOpcion(faseId) {
    setOpcionDialog({ faseId, mode: "create" });
    setEditOpcionId(null);
    setOpcionNombre("");
    setOpcionStockKey("");
    setOpcionCantidad("");
  }
  function openEditOpcion(faseId, op) {
    setOpcionDialog({ faseId, mode: "edit" });
    setEditOpcionId(op.id);
    setOpcionNombre(op.name);
    setOpcionStockKey(op.stockKey ?? "");
    setOpcionCantidad(String(op.cantidad ?? 1));
  }
  async function confirmDeleteOpcion() {
    if (!deleteOpcion) return;
    setSaving(true);
    try {
      await deleteFaseOpcion(deleteOpcion.id);
      toast.success(`"${deleteOpcion.name}" eliminada`);
      if (editOpcionId === deleteOpcion.id) {
        setOpcionDialog(null);
        setEditOpcionId(null);
      }
      setDeleteOpcion(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }
  async function saveOpcion() {
    if (!opcionDialog || !opcionNombre.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    const stockKey = opcionStockKey.trim() || void 0;
    const parsedQty = parseCantidadInventario(stockKey, opcionCantidad);
    if (!parsedQty.ok) {
      toast.error(parsedQty.message);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: opcionNombre.trim(),
        inventario_clave: stockKey,
        cantidad: parsedQty.cantidad
      };
      if (opcionDialog.mode === "create") {
        await createFaseOpcion(opcionDialog.faseId, payload);
        toast.success("Opción agregada");
      } else if (editOpcionId) {
        await updateFaseOpcion(editOpcionId, payload);
        toast.success("Opción actualizada");
      }
      setOpcionDialog(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "h-5 w-5 text-muted-foreground" }),
        "Fases del pedido"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Define etapas como Topping, Néctar, etc. En cada opción escribe cuánto lleva (ej. 50 g de tajín, 0.05 L de chamoy); al vender se resta del inventario." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Fases" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Ej. Topping, Néctar, Escarcha" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreateFase, className: "gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Nueva fase"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-6", children: fases2.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: 'Crea la primera fase (por ejemplo "Topping").' }) : fases2.map((fase) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: fase.name }),
            fase.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: fase.description }),
            fase.activo === false && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-1 text-xs", children: "Oculta" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => openEditFase(fase), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 mr-1" }),
              "Editar fase"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "secondary", onClick: () => openCreateOpcion(fase.id), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
              "Opción"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: fase.opciones.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Sin opciones" }) : fase.opciones.map((op) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "inline-flex items-center rounded-full border text-sm overflow-hidden",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => openEditOpcion(fase.id, op),
                  className: "inline-flex items-center gap-1 px-3 py-1 hover:bg-muted",
                  children: [
                    op.name,
                    op.stockKey && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] opacity-60 ml-0.5", children: [
                      "·",
                      formatCantidadInventario(
                        op.cantidad ?? 1,
                        findInventarioItem(inventarioKeys, op.stockKey)?.unit ?? ""
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3 opacity-50" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setDeleteOpcion({ id: op.id, name: op.name }),
                  className: "px-2 py-1 border-l hover:bg-destructive/10 hover:text-destructive",
                  "aria-label": `Eliminar ${op.name}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                }
              )
            ]
          },
          op.id
        )) })
      ] }, fase.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: faseDialog !== null, onOpenChange: (o) => !o && setFaseDialog(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: faseDialog === "create" ? "Nueva fase" : "Editar fase" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: faseForm.nombre,
              onChange: (e) => setFaseForm((f) => ({ ...f, nombre: e.target.value })),
              placeholder: "Ej. Topping, Néctar"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Descripción" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: faseForm.descripcion,
              onChange: (e) => setFaseForm((f) => ({ ...f, descripcion: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Activa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: faseForm.activo,
              onCheckedChange: (activo) => setFaseForm((f) => ({ ...f, activo }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setFaseDialog(null), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void saveFase(), disabled: saving, children: "Guardar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: opcionDialog !== null, onOpenChange: (o) => !o && setOpcionDialog(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: opcionDialog?.mode === "create" ? "Nueva opción" : "Editar opción" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: opcionNombre, onChange: (e) => setOpcionNombre(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Inventario (clave)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: opcionStockKey || "__none__",
              onValueChange: (v) => setOpcionStockKey(v === "__none__" ? "" : v),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sin descuento" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Sin vínculo" }),
                  inventarioKeys.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: i.key, children: inventarioSelectLabel(i) }, i.key))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CantidadInventarioField,
          {
            inventario: inventarioKeys,
            stockKey: opcionStockKey,
            value: opcionCantidad,
            onChange: setOpcionCantidad
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex-col-reverse sm:flex-row sm:justify-between gap-2", children: [
        opcionDialog?.mode === "edit" && editOpcionId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "destructive",
            className: "sm:mr-auto",
            disabled: saving,
            onClick: () => {
              const name = opcionNombre.trim() || "esta opción";
              setDeleteOpcion({ id: editOpcionId, name });
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-1" }),
              "Eliminar"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 sm:ml-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpcionDialog(null), children: "Cancelar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void saveOpcion(), disabled: saving, children: "Guardar" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: deleteOpcion !== null,
        onOpenChange: (open) => !open && setDeleteOpcion(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "¿Eliminar opción?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "Se quitará ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteOpcion?.name }),
              " de esta fase y de los productos que la tengan asignada. Esta acción no se puede deshacer."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: saving, children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                disabled: saving,
                onClick: (e) => {
                  e.preventDefault();
                  void confirmDeleteOpcion();
                },
                children: "Eliminar"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
function AdminCategorias() {
  const [categorias, setCategorias] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [dialog, setDialog] = reactExports.useState(null);
  const [editId, setEditId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ nombre: "", descripcion: "", activo: true });
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const menu = await fetchMenuAdmin();
      setCategorias(menu.categorias);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void load();
  }, [load]);
  function openCreate() {
    setDialog("create");
    setEditId(null);
    setForm({ nombre: "", descripcion: "", activo: true });
  }
  function openEdit(c) {
    setDialog("edit");
    setEditId(c.id);
    setForm({
      nombre: c.name,
      descripcion: c.description ?? "",
      activo: c.activo !== false
    });
  }
  async function save() {
    if (!form.nombre.trim()) {
      toast.error("Nombre de categoría requerido");
      return;
    }
    setSaving(true);
    try {
      if (dialog === "create") {
        await createCategoria({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          activo: form.activo
        });
        toast.success("Categoría creada");
      } else if (editId) {
        await updateCategoria(editId, {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          activo: form.activo
        });
        toast.success("Categoría actualizada");
      }
      setDialog(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-5 w-5 text-muted-foreground" }),
        "Categorías del menú"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Organiza el menú en secciones. Los productos se asignan a una categoría desde el apartado Menú." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-row items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Listado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            categorias.length,
            " categoría",
            categorias.length === 1 ? "" : "s",
            " en total"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          "Nueva categoría"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: categorias.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground col-span-full py-8 text-center", children: "No hay categorías. Crea la primera para empezar a agregar productos." }) : categorias.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-4 flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold truncate", children: c.name }),
            !c.activo && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-1 text-xs", children: "Oculta" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 line-clamp-2", children: c.description || "Sin descripción" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "shrink-0", children: [
            c.productos.length,
            " prod."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "w-fit gap-1",
            onClick: () => openEdit(c),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
              "Editar"
            ]
          }
        )
      ] }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: dialog !== null, onOpenChange: (o) => !o && setDialog(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: dialog === "create" ? "Nueva categoría" : "Editar categoría" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.nombre,
              onChange: (e) => setForm((f) => ({ ...f, nombre: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Descripción" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: form.descripcion,
              onChange: (e) => setForm((f) => ({ ...f, descripcion: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Visible en menú" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: form.activo,
              onCheckedChange: (activo) => setForm((f) => ({ ...f, activo }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDialog(null), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void save(), disabled: saving, children: "Guardar" })
      ] })
    ] }) })
  ] });
}
const Checkbox = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Checkbox$1,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckboxIndicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = Checkbox$1.displayName;
function defaultPasos(fases2) {
  const ids = fases2.filter((f) => f.activo !== false).map((f) => f.id);
  return normalizeProductPasos(void 0, ids.length ? ids : ["topping"]);
}
const emptyProductForm = (categoriaId = "", fases2 = []) => ({
  nombre: "",
  precio: "",
  descripcion: "",
  categoriaId,
  activo: true,
  pasos: defaultPasos(fases2),
  opcionIds: [],
  consumo: []
});
function AdminMenu() {
  const [categorias, setCategorias] = reactExports.useState([]);
  const [fases2, setFases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [productDialog, setProductDialog] = reactExports.useState(null);
  const [editProductId, setEditProductId] = reactExports.useState(null);
  const [prodForm, setProdForm] = reactExports.useState(emptyProductForm);
  const [selectedCategoriaId, setSelectedCategoriaId] = reactExports.useState(null);
  const [inventarioKeys, setInventarioKeys] = reactExports.useState([]);
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const menu = await fetchMenuAdmin();
      setCategorias(menu.categorias);
      setFases(menu.fases);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar menú");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void load();
  }, [load]);
  reactExports.useEffect(() => {
    fetchInventario().then(setInventarioKeys).catch(() => setInventarioKeys([]));
  }, []);
  function openCreateProduct(categoriaId) {
    const catId = categoriaId ?? selectedCategoriaId ?? categorias[0]?.id ?? "";
    setProductDialog("create");
    setEditProductId(null);
    setProdForm(emptyProductForm(catId, fases2));
  }
  function openEditProduct(p) {
    const faseIds = fases2.map((f) => f.id);
    setProductDialog("edit");
    setEditProductId(p.id);
    setProdForm({
      nombre: p.name,
      precio: String(p.price),
      descripcion: p.description,
      categoriaId: p.categoriaId ?? categorias[0]?.id ?? "",
      activo: p.activo !== false,
      pasos: normalizeProductPasos(p.pasos, faseIds),
      opcionIds: p.faseOpciones.map((o) => o.id),
      consumo: p.consumo?.length ? [...p.consumo] : []
    });
  }
  function addConsumoLine() {
    setProdForm((f) => ({
      ...f,
      consumo: [...f.consumo, { clave: inventarioKeys[0]?.key ?? "", cantidad: 1 }]
    }));
  }
  function updateConsumoLine(index, patch) {
    setProdForm((f) => ({
      ...f,
      consumo: f.consumo.map((line, i) => i === index ? { ...line, ...patch } : line)
    }));
  }
  function removeConsumoLine(index) {
    setProdForm((f) => ({
      ...f,
      consumo: f.consumo.filter((_, i) => i !== index)
    }));
  }
  function toggleFasePaso(faseId) {
    const paso = fasePasoId(faseId);
    setProdForm((f) => ({
      ...f,
      pasos: f.pasos.includes(paso) ? f.pasos.filter((s) => s !== paso) : [...f.pasos, paso]
    }));
  }
  function toggleNotasPaso() {
    setProdForm((f) => ({
      ...f,
      pasos: f.pasos.includes(PASO_NOTAS) ? f.pasos.filter((s) => s !== PASO_NOTAS) : [...f.pasos, PASO_NOTAS]
    }));
  }
  function toggleOpcion(id) {
    setProdForm((f) => ({
      ...f,
      opcionIds: f.opcionIds.includes(id) ? f.opcionIds.filter((x) => x !== id) : [...f.opcionIds, id]
    }));
  }
  async function saveProduct() {
    if (!prodForm.nombre.trim() || !prodForm.precio) {
      toast.error("Nombre y precio son obligatorios");
      return;
    }
    if (!prodForm.pasos.some(isFasePaso) && !prodForm.pasos.includes(PASO_NOTAS)) {
      toast.error("Selecciona al menos una fase o notas");
      return;
    }
    if (!prodForm.categoriaId) {
      toast.error("Selecciona una categoría");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: prodForm.nombre.trim(),
        precio: Number(prodForm.precio),
        descripcion: prodForm.descripcion.trim(),
        categoria_id: prodForm.categoriaId,
        pasos: prodForm.pasos,
        opcion_ids: prodForm.opcionIds,
        consumo: prodForm.consumo.filter((c) => c.clave.trim()),
        activo: prodForm.activo
      };
      if (productDialog === "create") {
        await createProducto(payload);
        toast.success("Producto creado");
      } else if (editProductId) {
        await updateProducto(editProductId, payload);
        toast.success("Producto actualizado");
      }
      setProductDialog(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  const categoriaActiva = categorias.find((c) => c.id === selectedCategoriaId);
  const productosCategoria = categoriaActiva?.productos ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Productos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: selectedCategoriaId ? "Administra los productos de la categoría elegida." : "Elige una categoría para ver y editar sus productos." })
    ] }),
    !selectedCategoriaId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-4 w-4 text-muted-foreground" }),
          "Categorías"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Toca una categoría para ver sus productos. Para crear o editar categorías, usa el apartado Categorías." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: categorias.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "No hay categorías. Créalas en el apartado Categorías." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: categorias.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setSelectedCategoriaId(cat.id),
          className: cn(
            "w-full text-left rounded-2xl border bg-card px-4 py-4",
            "flex items-center gap-3 min-h-[5rem]",
            "hover:border-foreground/25 hover:bg-muted/30 transition-colors",
            !cat.activo && "opacity-70"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-[15px] leading-tight tracking-tight", children: cat.name }),
              cat.description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 line-clamp-2", children: cat.description }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "text-xs font-normal", children: [
                  cat.productos.length,
                  " producto",
                  cat.productos.length === 1 ? "" : "s"
                ] }),
                cat.activo === false && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Oculta" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5 shrink-0 text-muted-foreground" })
          ]
        },
        cat.id
      )) }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "h-8 px-2 -ml-2 gap-1 text-muted-foreground",
              onClick: () => setSelectedCategoriaId(null),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
                "Todas las categorías"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: categoriaActiva?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
              productosCategoria.length,
              " producto",
              productosCategoria.length === 1 ? "" : "s",
              " en esta categoría"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => openCreateProduct(selectedCategoriaId),
            className: "gap-2 shrink-0 w-full sm:w-auto",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
              "Nuevo producto"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: productosCategoria.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Esta categoría no tiene productos. Agrega el primero con el botón de arriba." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: productosCategoria.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-4 flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold leading-tight", children: p.name }),
            !p.activo && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-1 text-xs", children: "Oculto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-1", children: p.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "shrink-0", children: [
            "$",
            p.price
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Fases:",
          " ",
          (p.pasos ?? []).filter(isFasePaso).map((paso) => {
            const fid = parseFaseIdFromPaso(paso);
            return fases2.find((f) => f.id === fid)?.name ?? fid;
          }).join(", ") || "—",
          " ",
          "→ adiciones"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "w-fit gap-1",
            onClick: () => openEditProduct(p),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }),
              "Editar"
            ]
          }
        )
      ] }, p.id)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: productDialog !== null, onOpenChange: (o) => !o && setProductDialog(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: productDialog === "create" ? "Nuevo producto" : "Editar producto" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: prodForm.nombre,
              onChange: (e) => setProdForm((f) => ({ ...f, nombre: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Precio base ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 1,
              value: prodForm.precio,
              onChange: (e) => setProdForm((f) => ({ ...f, precio: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Descripción" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: prodForm.descripcion,
              onChange: (e) => setProdForm((f) => ({ ...f, descripcion: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Categoría" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: prodForm.categoriaId,
              onValueChange: (v) => setProdForm((f) => ({ ...f, categoriaId: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Elige categoría" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: categorias.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.name }, c.id)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fases en el pedido (mesero)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cada fase activa un paso aparte. Adiciones es global (apartado Adiciones)." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-lg border p-3", children: [
            fases2.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Crea fases en el apartado Fases." }) : fases2.map((fase) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: prodForm.pasos.includes(fasePasoId(fase.id)),
                  onCheckedChange: () => toggleFasePaso(fase.id)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: fase.name }),
                fase.description && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground", children: fase.description })
              ] })
            ] }, fase.id)),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer pt-2 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: prodForm.pasos.includes(PASO_NOTAS),
                  onCheckedChange: toggleNotasPaso
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: "Notas" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-muted-foreground", children: "Indicaciones para barra" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Consumo base (inventario)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: addConsumoLine, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
              "Línea"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cantidad fija que lleva cada venta (misma unidad que en Inventario: g, L, pz)." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 rounded-lg border p-3", children: prodForm.consumo.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Vacío = reglas por defecto (cerveza + limón)." }) : prodForm.consumo.map((line, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[8rem] space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Clave" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: line.clave || "__none__",
                  onValueChange: (v) => updateConsumoLine(idx, { clave: v === "__none__" ? "" : v }),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: inventarioKeys.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: i.key, children: inventarioSelectLabel(i) }, i.key)) })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-28 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Cantidad" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    type: "number",
                    min: 1e-3,
                    step: "any",
                    className: "h-9",
                    value: line.cantidad,
                    placeholder: cantidadPlaceholder(
                      findInventarioItem(inventarioKeys, line.clave)?.unit
                    ),
                    onChange: (e) => updateConsumoLine(idx, {
                      cantidad: Number(e.target.value) || 1
                    })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground w-6 shrink-0", children: findInventarioItem(inventarioKeys, line.clave)?.unit ?? "" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                className: "text-destructive",
                onClick: () => removeConsumoLine(idx),
                children: "Quitar"
              }
            )
          ] }, idx)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Opciones por fase" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 overflow-y-auto space-y-3 rounded-lg border p-3", children: fases2.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sin fases configuradas" }) : fases2.map((fase) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground mb-1.5", children: fase.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 pl-1", children: fase.opciones.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sin opciones" }) : fase.opciones.map((op) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Checkbox,
                {
                  checked: prodForm.opcionIds.includes(op.id),
                  onCheckedChange: () => toggleOpcion(op.id)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: op.name })
            ] }, op.id)) })
          ] }, fase.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Visible en menú" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: prodForm.activo,
              onCheckedChange: (activo) => setProdForm((f) => ({ ...f, activo }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setProductDialog(null), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void saveProduct(), disabled: saving, children: "Guardar" })
      ] })
    ] }) })
  ] });
}
async function adminFetch(path, init) {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
      ...init?.headers
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}
function listUsers() {
  return adminFetch("/api/admin/users");
}
function createUser(input) {
  return adminFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
function updateUser(id, input) {
  return adminFetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}
const ROLES = ["admin", "mesero", "cocinero"];
const emptyForm = {
  nombre: "",
  email: "",
  password: "",
  rol: "mesero",
  activo: true
};
function AdminUsers() {
  const [users, setUsers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(emptyForm);
  const currentId = getStoredSession()?.user.id;
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await listUsers());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    void load();
  }, [load]);
  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(user) {
    setEditing(user);
    setForm({
      nombre: user.nombre,
      email: user.email,
      password: "",
      rol: user.rol,
      activo: user.activo
    });
    setOpen(true);
  }
  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        const patch = {
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          rol: form.rol,
          activo: form.activo
        };
        if (form.password.trim()) patch.password = form.password;
        await updateUser(editing.id, patch);
        toast.success("Usuario actualizado");
      } else {
        const input = {
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          password: form.password,
          rol: form.rol
        };
        await createUser(input);
        toast.success("Usuario creado");
      }
      setOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Equipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Meseros, barra y administradores" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openCreate, className: "gap-2 w-full sm:w-auto min-h-11 sm:min-h-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-4 w-4" }),
        "Nuevo usuario"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Usuarios registrados" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Gestiona accesos y roles del sistema" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : users.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No hay usuarios" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-2", children: users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "rounded-xl border p-3 flex items-center justify-between gap-3",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-sm truncate", children: [
                  u.nombre,
                  u.id === currentId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-muted-foreground", children: "(tú)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: u.email }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 mt-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: ROL_LABELS[u.rol] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: u.activo ? "secondary" : "outline", className: "text-[10px]", children: u.activo ? "Activo" : "Inactivo" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  size: "icon",
                  className: "shrink-0 h-10 w-10",
                  onClick: () => openEdit(u),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" })
                }
              )
            ]
          },
          u.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-4", children: "Nombre" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-4", children: "Correo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-4", children: "Rol" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-4", children: "Estado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 w-20" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-4 font-medium", children: [
              u.nombre,
              u.id === currentId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-muted-foreground", children: "(tú)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4 text-muted-foreground", children: u.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4", children: ROL_LABELS[u.rol] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: u.activo ? "secondary" : "outline", children: u.activo ? "Activo" : "Inactivo" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => openEdit(u), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }) })
          ] }, u.id)) })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Editar usuario" : "Nuevo usuario" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "nombre", children: "Nombre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "nombre",
              value: form.nombre,
              onChange: (e) => setForm((f) => ({ ...f, nombre: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Correo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "email",
              type: "email",
              value: form.email,
              onChange: (e) => setForm((f) => ({ ...f, email: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "password", children: [
            "Contraseña ",
            editing && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "(opcional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "password",
              type: "password",
              value: form.password,
              onChange: (e) => setForm((f) => ({ ...f, password: e.target.value })),
              placeholder: editing ? "Dejar vacío para no cambiar" : ""
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rol" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.rol, onValueChange: (v) => setForm((f) => ({ ...f, rol: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: ROL_LABELS[r] }, r)) })
          ] })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "activo", children: "Cuenta activa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              id: "activo",
              checked: form.activo,
              onCheckedChange: (activo) => setForm((f) => ({ ...f, activo })),
              disabled: editing.id === currentId
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), disabled: saving, children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: () => void handleSave(),
            disabled: saving || !form.nombre.trim() || !form.email.trim() || !editing && form.password.length < 6,
            children: [
              saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              "Guardar"
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
function mapReporte(raw) {
  return {
    periodo: raw.periodo,
    label: String(raw.label),
    desde: String(raw.desde),
    hasta: String(raw.hasta),
    totalVentas: Number(raw.totalVentas),
    numComandas: Number(raw.numComandas),
    numItems: Number(raw.numItems),
    ticketPromedio: Number(raw.ticketPromedio),
    porEstado: (raw.porEstado ?? []).map((r) => ({
      status: String(r.status),
      count: Number(r.count),
      total: Number(r.total)
    })),
    topProductos: (raw.topProductos ?? []).map((r) => ({
      productoId: String(r.productoId),
      productoNombre: String(r.productoNombre),
      cantidad: Number(r.cantidad),
      total: Number(r.total)
    })),
    porMesa: (raw.porMesa ?? []).map((r) => ({
      mesa: String(r.mesa),
      count: Number(r.count),
      total: Number(r.total)
    })),
    porMesero: (raw.porMesero ?? []).map((r) => ({
      meseroId: r.meseroId != null ? Number(r.meseroId) : null,
      meseroNombre: String(r.meseroNombre),
      count: Number(r.count),
      total: Number(r.total)
    })),
    serie: (raw.serie ?? []).map((r) => ({
      label: String(r.label),
      count: Number(r.count),
      total: Number(r.total)
    }))
  };
}
async function fetchReporte(params) {
  const session = getStoredSession();
  if (!session?.accessToken) {
    throw new Error("Sesión requerida");
  }
  const q = new URLSearchParams({ periodo: params.periodo });
  if (params.fecha) q.set("fecha", params.fecha);
  if (params.anio != null) q.set("anio", String(params.anio));
  if (params.mes != null) q.set("mes", String(params.mes));
  const res = await fetch(`${getApiUrl()}/api/reportes?${q}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(parseApiError(data, res.status));
  }
  return mapReporte(data);
}
const MESES$1 = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" }
];
const ESTADO_LABEL = {
  pendiente: "Pendiente",
  lista: "Lista",
  entregada: "Entregada"
};
function todayIso$1() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function money$2(n) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
function SerieChart({ serie }) {
  const max = Math.max(...serie.map((p) => p.total), 1);
  if (serie.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-6 text-center", children: "Sin ventas en el periodo" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-1 sm:gap-2 h-40 pt-2 overflow-x-auto pb-1", children: serie.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 min-w-[2rem] flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground tabular-nums", children: money$2(p.total) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "w-full max-w-12 mx-auto rounded-t bg-primary/80 min-h-[4px] transition-all",
        style: { height: `${Math.max(8, p.total / max * 120)}px` },
        title: `${p.count} comandas`
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-muted-foreground", children: p.label })
  ] }, p.label)) });
}
function DataTable({
  headers,
  rows
}) {
  if (rows.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-4 text-center", children: "Sin datos" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b text-left text-muted-foreground", children: headers.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-4 last:pr-0 last:text-right", children: h }, h)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b last:border-0", children: row.map((cell, j) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "td",
      {
        className: cn(
          "py-2 pr-4 last:pr-0",
          j === row.length - 1 && "text-right font-medium tabular-nums"
        ),
        children: cell
      },
      j
    )) }, i)) })
  ] }) });
}
function AdminReportes() {
  const [periodo, setPeriodo] = reactExports.useState("dia");
  const [fecha, setFecha] = reactExports.useState("");
  const [anio, setAnio] = reactExports.useState("");
  const [mes, setMes] = reactExports.useState("");
  const [filtersReady, setFiltersReady] = reactExports.useState(false);
  const [reporte, setReporte] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [yearBase, setYearBase] = reactExports.useState(2026);
  reactExports.useEffect(() => {
    const now = /* @__PURE__ */ new Date();
    setFecha(todayIso$1());
    setAnio(String(now.getFullYear()));
    setMes(String(now.getMonth() + 1));
    setYearBase(now.getFullYear());
    setFiltersReady(true);
  }, []);
  const params = reactExports.useMemo(() => {
    if (!filtersReady) return null;
    if (periodo === "dia") return { periodo, fecha };
    if (periodo === "mes") return { periodo, anio: Number(anio), mes: Number(mes) };
    return { periodo, anio: Number(anio) };
  }, [periodo, fecha, anio, mes, filtersReady]);
  const load = reactExports.useCallback(async () => {
    if (!params) return;
    setLoading(true);
    try {
      setReporte(await fetchReporte(params));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar reporte");
      setReporte(null);
    } finally {
      setLoading(false);
    }
  }, [params]);
  reactExports.useEffect(() => {
    void load();
  }, [load]);
  const years = reactExports.useMemo(() => [yearBase, yearBase - 1, yearBase - 2], [yearBase]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-5 w-5 text-muted-foreground" }),
          "Reportes"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Ventas y operación filtradas por día, mes o año." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "gap-2", onClick: () => void load(), disabled: loading, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("h-4 w-4", loading && "animate-spin") }),
        "Actualizar"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
          "Periodo"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Elige cómo agrupar las comandas" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: [
          { id: "dia", label: "Por día" },
          { id: "mes", label: "Por mes" },
          { id: "anio", label: "Por año" }
        ].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: periodo === p.id ? "default" : "outline",
            size: "sm",
            onClick: () => setPeriodo(p.id),
            children: p.label
          },
          p.id
        )) }),
        periodo === "dia" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-w-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "fecha-reporte", children: "Fecha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "fecha-reporte",
              type: "date",
              value: fecha,
              onChange: (e) => setFecha(e.target.value)
            }
          )
        ] }),
        periodo === "mes" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 w-36", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Año" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: anio, onValueChange: setAnio, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 w-44", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mes, onValueChange: setMes, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MESES$1.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(m.value), children: m.label }, m.value)) })
            ] })
          ] })
        ] }),
        periodo === "anio" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 w-36", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Año" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: anio, onValueChange: setAnio, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] })
        ] })
      ] })
    ] }),
    !filtersReady || loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : reporte ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: reporte.label }),
        reporte.desde !== reporte.hasta && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          " ",
          "· ",
          reporte.desde,
          " — ",
          reporte.hasta
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Ventas" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: money$2(reporte.totalVentas) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              reporte.numComandas,
              " comandas"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Ticket promedio" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: money$2(reporte.ticketPromedio) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Bebidas vendidas" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: reporte.numItems }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "líneas en pedidos" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Por estado" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-1 text-sm", children: reporte.porEstado.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "—" }) : reporte.porEstado.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ESTADO_LABEL[e.status] ?? e.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular-nums", children: [
              e.count,
              " · ",
              money$2(e.total)
            ] })
          ] }, e.status)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: periodo === "dia" ? "Ventas por hora" : periodo === "mes" ? "Ventas por día" : "Ventas por mes" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SerieChart, { serie: reporte.serie }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Productos más vendidos" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DataTable,
            {
              headers: ["Producto", "Cant.", "Total"],
              rows: reporte.topProductos.map((p) => [
                p.productoNombre,
                p.cantidad,
                money$2(p.total)
              ])
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Por mesa" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DataTable,
            {
              headers: ["Mesa", "Comandas", "Total"],
              rows: reporte.porMesa.map((m) => [m.mesa, m.count, money$2(m.total)])
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Por mesero" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DataTable,
            {
              headers: ["Mesero", "Comandas", "Total"],
              rows: reporte.porMesero.map((m) => [
                m.meseroNombre,
                m.count,
                money$2(m.total)
              ])
            }
          ) })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: "No se pudo cargar el reporte" })
  ] });
}
async function nominaFetch(path, init) {
  const session = getStoredSession();
  if (!session?.accessToken) throw new Error("Sesión requerida");
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
      ...init?.headers
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data;
}
function fetchNominaPeriodo(params) {
  const q = new URLSearchParams({
    anio: String(params.anio),
    mes: String(params.mes)
  });
  if (params.quincena != null && params.quincena > 0) {
    q.set("quincena", String(params.quincena));
  }
  return nominaFetch(`/api/admin/nomina?${q}`);
}
function upsertNominaConfig(usuarioId, body) {
  return nominaFetch(`/api/admin/nomina/config/${usuarioId}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}
function createNominaPrestamo(body) {
  return nominaFetch("/api/admin/nomina/prestamos", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function updateNominaPrestamo(prestamoId, body) {
  return nominaFetch(`/api/admin/nomina/prestamos/${prestamoId}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}
function deleteNominaPrestamo(prestamoId) {
  return nominaFetch(`/api/admin/nomina/prestamos/${prestamoId}`, { method: "DELETE" });
}
function createNominaRecibo(body) {
  return nominaFetch("/api/admin/nomina/recibos", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
function updateNominaRecibo(reciboId, body) {
  return nominaFetch(`/api/admin/nomina/recibos/${reciboId}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}
function deleteNominaRecibo(reciboId) {
  return nominaFetch(`/api/admin/nomina/recibos/${reciboId}`, { method: "DELETE" });
}
const TIPO_PAGO_LABEL = {
  diario: "Por día",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual"
};
const DIAS_REF_TIPO = {
  diario: 1,
  semanal: 7,
  quincenal: 15,
  mensual: 30
};
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];
function money$1(n) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function AdminNomina() {
  const now = /* @__PURE__ */ new Date();
  const [anio, setAnio] = reactExports.useState(String(now.getFullYear()));
  const [mes, setMes] = reactExports.useState(String(now.getMonth() + 1));
  const [modoPeriodo, setModoPeriodo] = reactExports.useState("q1");
  const [periodo, setPeriodo] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [configTarget, setConfigTarget] = reactExports.useState(null);
  const [configForm, setConfigForm] = reactExports.useState({
    salarioBase: "",
    tipoPago: "quincenal",
    tarifaHoraExtra: "",
    puesto: ""
  });
  const [reciboTarget, setReciboTarget] = reactExports.useState(null);
  const [reciboForm, setReciboForm] = reactExports.useState({
    diasTrabajados: "15",
    horasExtra: "0",
    bonos: "0",
    deducciones: "0",
    descuentoPrestamos: "0",
    aplicarPrestamosAuto: true,
    notas: ""
  });
  const [prestamoTarget, setPrestamoTarget] = reactExports.useState(null);
  const [prestamoForm, setPrestamoForm] = reactExports.useState({
    concepto: "",
    montoTotal: "",
    cuotaPeriodo: ""
  });
  const quincena = modoPeriodo === "q1" ? 1 : modoPeriodo === "q2" ? 2 : null;
  const load = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNominaPeriodo({
        anio: Number(anio),
        mes: Number(mes),
        quincena
      });
      setPeriodo(data);
      return data;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar nómina");
      setPeriodo(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [anio, mes, quincena]);
  reactExports.useEffect(() => {
    void load();
  }, [load]);
  const years = reactExports.useMemo(() => {
    const y = now.getFullYear();
    return [y, y - 1];
  }, [now]);
  const diasRef = configForm.tipoPago ? DIAS_REF_TIPO[configForm.tipoPago] : 15;
  function openConfig(emp) {
    setConfigTarget(emp);
    setConfigForm({
      salarioBase: emp.config ? String(emp.config.salarioBase) : "",
      tipoPago: emp.config?.tipoPago ?? "quincenal",
      tarifaHoraExtra: emp.config?.tarifaHoraExtra != null ? String(emp.config.tarifaHoraExtra) : "",
      puesto: emp.config?.puesto ?? ""
    });
  }
  function openRecibo(emp) {
    if (!emp.config) {
      toast.error("Primero configura el salario del empleado");
      return;
    }
    setReciboTarget(emp);
    const ref = DIAS_REF_TIPO[emp.config.tipoPago];
    const sugerido = emp.descuentoPrestamosSugerido;
    setReciboForm({
      diasTrabajados: emp.recibo ? String(emp.recibo.diasTrabajados) : String(ref),
      horasExtra: emp.recibo ? String(emp.recibo.horasExtra) : "0",
      bonos: emp.recibo ? String(emp.recibo.bonos) : "0",
      deducciones: emp.recibo ? String(emp.recibo.deducciones) : "0",
      descuentoPrestamos: emp.recibo ? String(emp.recibo.descuentoPrestamos) : sugerido > 0 ? String(sugerido) : "0",
      aplicarPrestamosAuto: !emp.recibo,
      notas: emp.recibo?.notas ?? ""
    });
  }
  function saldoPrestamos(emp) {
    return emp.prestamos.filter((p) => p.activo && p.saldoPendiente > 0).reduce((s, p) => s + p.saldoPendiente, 0);
  }
  function openPrestamos(emp) {
    setPrestamoTarget(emp);
    setPrestamoForm({ concepto: "", montoTotal: "", cuotaPeriodo: "" });
  }
  async function addPrestamo() {
    if (!prestamoTarget) return;
    const monto = Number(prestamoForm.montoTotal);
    const cuota = Number(prestamoForm.cuotaPeriodo);
    if (!prestamoForm.concepto.trim()) {
      toast.error("Indica el concepto del préstamo");
      return;
    }
    if (!Number.isFinite(monto) || monto <= 0 || !Number.isFinite(cuota) || cuota <= 0) {
      toast.error("Monto y cuota deben ser mayores a cero");
      return;
    }
    setSaving(true);
    try {
      await createNominaPrestamo({
        usuarioId: prestamoTarget.usuarioId,
        concepto: prestamoForm.concepto.trim(),
        montoTotal: monto,
        cuotaPeriodo: cuota
      });
      toast.success("Préstamo registrado");
      setPrestamoForm({ concepto: "", montoTotal: "", cuotaPeriodo: "" });
      const uid = prestamoTarget.usuarioId;
      const data = await load();
      const refreshed = data?.empleados.find((e) => e.usuarioId === uid);
      if (refreshed) setPrestamoTarget(refreshed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo registrar préstamo");
    } finally {
      setSaving(false);
    }
  }
  async function togglePrestamoActivo(p, activo) {
    setSaving(true);
    try {
      await updateNominaPrestamo(p.id, { activo });
      toast.success(activo ? "Préstamo reactivado" : "Préstamo pausado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }
  async function removePrestamo(p) {
    setSaving(true);
    try {
      await deleteNominaPrestamo(p.id);
      toast.success("Préstamo eliminado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }
  async function saveConfig() {
    if (!configTarget) return;
    const salario = Number(configForm.salarioBase);
    if (!Number.isFinite(salario) || salario < 0) {
      toast.error("Salario inválido");
      return;
    }
    setSaving(true);
    try {
      await upsertNominaConfig(configTarget.usuarioId, {
        salarioBase: salario,
        tipoPago: configForm.tipoPago,
        tarifaHoraExtra: configForm.tarifaHoraExtra.trim() ? Number(configForm.tarifaHoraExtra) : void 0,
        puesto: configForm.puesto.trim() || void 0
      });
      toast.success("Configuración guardada");
      setConfigTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }
  async function saveRecibo() {
    if (!reciboTarget || !periodo) return;
    const descManual = Number(reciboForm.descuentoPrestamos);
    const payload = {
      diasTrabajados: Number(reciboForm.diasTrabajados) || 0,
      horasExtra: Number(reciboForm.horasExtra) || 0,
      bonos: Number(reciboForm.bonos) || 0,
      deducciones: Number(reciboForm.deducciones) || 0,
      descuentoPrestamos: Number.isFinite(descManual) ? descManual : void 0,
      aplicarPrestamosAuto: reciboForm.aplicarPrestamosAuto,
      notas: reciboForm.notas.trim() || void 0
    };
    setSaving(true);
    try {
      if (reciboTarget.recibo) {
        await updateNominaRecibo(reciboTarget.recibo.id, payload);
        toast.success("Recibo actualizado");
      } else {
        await createNominaRecibo({
          usuarioId: reciboTarget.usuarioId,
          anio: periodo.anio,
          mes: periodo.mes,
          quincena: periodo.quincena,
          ...payload
        });
        toast.success("Recibo generado");
      }
      setReciboTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar recibo");
    } finally {
      setSaving(false);
    }
  }
  async function markPaid(emp) {
    if (!emp.recibo) return;
    setSaving(true);
    try {
      await updateNominaRecibo(emp.recibo.id, { estado: "pagado" });
      toast.success("Marcado como pagado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }
  async function removeRecibo(emp) {
    if (!emp.recibo) return;
    setSaving(true);
    try {
      await deleteNominaRecibo(emp.recibo.id);
      toast.success("Recibo eliminado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }
  const activos = periodo?.empleados.filter((e) => e.activo) ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-5 w-5 text-muted-foreground" }),
          "Nómina"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Sueldos, préstamos a empleados, descuentos en recibos y control de pagos." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "gap-2 w-full sm:w-auto min-h-10 sm:min-h-0",
          onClick: () => void load(),
          disabled: loading,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("h-4 w-4", loading && "animate-spin") }),
            "Actualizar"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
        "Periodo de pago"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:w-28", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Año" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: anio, onValueChange: setAnio, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 sm:w-40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mes, onValueChange: setMes, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MESES.map((label, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(i + 1), children: label }, label)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2 sm:col-span-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corte" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: [
            { id: "mes", label: "Mes completo" },
            { id: "q1", label: "1ª quincena" },
            { id: "q2", label: "2ª quincena" }
          ].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              size: "sm",
              variant: modoPeriodo === p.id ? "default" : "outline",
              onClick: () => setModoPeriodo(p.id),
              children: p.label
            },
            p.id
          )) })
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : periodo ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: periodo.label }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Total neto" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: money$1(periodo.resumen.totalNeto) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Pagado" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-emerald-600", children: money$1(periodo.resumen.totalPagado) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              periodo.resumen.empleadosPagados,
              " de ",
              periodo.resumen.empleadosConRecibo,
              " recibos"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Bruto" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: money$1(periodo.resumen.totalBruto) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Desc. préstamos" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-700", children: money$1(periodo.resumen.totalPrestamos) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              periodo.resumen.prestamosActivos,
              " empleado(s) con saldo"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Empleados" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: activos.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "usuarios activos" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Recibos del periodo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Configura salario, captura días trabajados y marca como pagado cuando liquides." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden space-y-3", children: activos.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border p-3 space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: emp.nombre }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  ROL_LABELS[emp.rol] ?? emp.rol,
                  emp.config?.puesto ? ` · ${emp.config.puesto}` : ""
                ] })
              ] }),
              emp.recibo ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: emp.recibo.estado === "pagado" ? "secondary" : "outline", children: emp.recibo.estado === "pagado" ? "Pagado" : "Borrador" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: "Sin recibo" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm tabular-nums", children: emp.recibo ? money$1(emp.recibo.total) : "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/50 p-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Préstamos" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm tabular-nums text-amber-700", children: saldoPrestamos(emp) > 0 ? money$1(saldoPrestamos(emp)) : "—" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: () => openConfig(emp), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 mr-1" }),
                "Salario"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: () => openPrestamos(emp), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-3.5 w-3.5 mr-1" }),
                "Préstamos"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  size: "sm",
                  variant: "outline",
                  onClick: () => openRecibo(emp),
                  disabled: !emp.config,
                  children: emp.recibo ? "Editar recibo" : "Generar"
                }
              ),
              emp.recibo?.estado === "borrador" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", onClick: () => void markPaid(emp), disabled: saving, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-3.5 w-3.5 mr-1" }),
                "Pagar"
              ] }),
              emp.recibo && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "button",
                  size: "sm",
                  variant: "ghost",
                  className: "text-destructive",
                  onClick: () => void removeRecibo(emp),
                  disabled: saving,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                }
              )
            ] })
          ] }, emp.usuarioId)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden md:block overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm min-w-[860px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b text-left text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-3", children: "Empleado" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-3", children: "Puesto / pago" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-3 text-right", children: "Préstamos" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-3", children: "Días" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-3 text-right", children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 pr-3", children: "Estado" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "pb-2 text-right", children: "Acciones" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: activos.map((emp) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-3 pr-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: emp.nombre }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: ROL_LABELS[emp.rol] ?? emp.rol })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-3", children: emp.config ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: emp.config.puesto || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
                  money$1(emp.config.salarioBase),
                  " · ",
                  TIPO_PAGO_LABEL[emp.config.tipoPago]
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-amber-600", children: "Sin configurar" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-3 text-right tabular-nums", children: saldoPrestamos(emp) > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-amber-700 font-medium", children: money$1(saldoPrestamos(emp)) }),
                emp.descuentoPrestamosSugerido > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "cuota: ",
                  money$1(emp.descuentoPrestamosSugerido)
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-3 tabular-nums", children: emp.recibo ? emp.recibo.diasTrabajados : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-3 text-right font-semibold tabular-nums", children: emp.recibo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: money$1(emp.recibo.total) }),
                emp.recibo.descuentoPrestamos > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-normal text-muted-foreground", children: [
                  "−",
                  money$1(emp.recibo.descuentoPrestamos),
                  " prést."
                ] })
              ] }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 pr-3", children: emp.recibo ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: emp.recibo.estado === "pagado" ? "secondary" : "outline", children: emp.recibo.estado === "pagado" ? "Pagado" : "Borrador" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Sin recibo" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap justify-end gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "ghost", onClick: () => openConfig(emp), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    variant: "outline",
                    title: "Préstamos",
                    onClick: () => openPrestamos(emp),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    variant: "outline",
                    onClick: () => openRecibo(emp),
                    disabled: !emp.config,
                    children: emp.recibo ? "Editar" : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" })
                  }
                ),
                emp.recibo?.estado === "borrador" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    onClick: () => void markPaid(emp),
                    disabled: saving,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-3.5 w-3.5 mr-1" }),
                      "Pagar"
                    ]
                  }
                ),
                emp.recibo && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    type: "button",
                    size: "sm",
                    variant: "ghost",
                    className: "text-destructive",
                    onClick: () => void removeRecibo(emp),
                    disabled: saving,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                  }
                )
              ] }) })
            ] }, emp.usuarioId)) })
          ] }) })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-8", children: "No se pudo cargar la nómina" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: configTarget !== null, onOpenChange: (o) => !o && setConfigTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Salario · ",
        configTarget?.nombre
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Puesto (opcional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: configForm.puesto,
              onChange: (e) => setConfigForm((f) => ({ ...f, puesto: e.target.value })),
              placeholder: "Mesero, barra..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Salario base del periodo ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              step: "0.01",
              value: configForm.salarioBase,
              onChange: (e) => setConfigForm((f) => ({ ...f, salarioBase: e.target.value }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Monto de referencia según tipo de pago (ej. quincenal = 15 días)." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo de pago" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: configForm.tipoPago,
              onValueChange: (v) => setConfigForm((f) => ({ ...f, tipoPago: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.keys(TIPO_PAGO_LABEL).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: t, children: [
                  TIPO_PAGO_LABEL[t],
                  " (",
                  DIAS_REF_TIPO[t],
                  " días ref.)"
                ] }, t)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tarifa hora extra ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              min: 0,
              step: "0.01",
              placeholder: "Auto si vacío",
              value: configForm.tarifaHoraExtra,
              onChange: (e) => setConfigForm((f) => ({ ...f, tarifaHoraExtra: e.target.value }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setConfigTarget(null), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void saveConfig(), disabled: saving, children: "Guardar" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: reciboTarget !== null, onOpenChange: (o) => !o && setReciboTarget(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Recibo · ",
        reciboTarget?.nombre,
        " · ",
        periodo?.label
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Días trabajados" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                step: "0.5",
                value: reciboForm.diasTrabajados,
                onChange: (e) => setReciboForm((f) => ({ ...f, diasTrabajados: e.target.value }))
              }
            ),
            reciboTarget?.config && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Ref. ",
              diasRef,
              " días"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Horas extra" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                step: "0.5",
                value: reciboForm.horasExtra,
                onChange: (e) => setReciboForm((f) => ({ ...f, horasExtra: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bonos ($)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                value: reciboForm.bonos,
                onChange: (e) => setReciboForm((f) => ({ ...f, bonos: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deducciones ($)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                value: reciboForm.deducciones,
                onChange: (e) => setReciboForm((f) => ({ ...f, deducciones: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Descuento por préstamos ($)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: reciboForm.aplicarPrestamosAuto,
                    onCheckedChange: (v) => setReciboForm((f) => ({
                      ...f,
                      aplicarPrestamosAuto: v,
                      descuentoPrestamos: v && reciboTarget ? String(reciboTarget.descuentoPrestamosSugerido) : f.descuentoPrestamos
                    }))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Cuota automática" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                step: "0.01",
                value: reciboForm.descuentoPrestamos,
                onChange: (e) => setReciboForm((f) => ({
                  ...f,
                  descuentoPrestamos: e.target.value,
                  aplicarPrestamosAuto: false
                }))
              }
            ),
            reciboTarget && saldoPrestamos(reciboTarget) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Saldo pendiente ",
              money$1(saldoPrestamos(reciboTarget)),
              reciboTarget.descuentoPrestamosSugerido > 0 && ` · sugerido este periodo: ${money$1(reciboTarget.descuentoPrestamosSugerido)}`
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notas" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: reciboForm.notas,
              onChange: (e) => setReciboForm((f) => ({ ...f, notas: e.target.value }))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setReciboTarget(null), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void saveRecibo(), disabled: saving, children: reciboTarget?.recibo ? "Actualizar" : "Generar recibo" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: prestamoTarget !== null,
        onOpenChange: (o) => {
          if (!o) setPrestamoTarget(null);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
            "Préstamos · ",
            prestamoTarget?.nombre
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2 max-h-[50vh] overflow-y-auto", children: [
            (prestamoTarget?.prestamos ?? []).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sin préstamos registrados." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: (prestamoTarget?.prestamos ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "li",
              {
                className: "flex flex-wrap items-start justify-between gap-2 rounded-md border p-3 text-sm",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: p.concepto }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                      "Total ",
                      money$1(p.montoTotal),
                      " · Saldo ",
                      money$1(p.saldoPendiente),
                      " · Cuota",
                      " ",
                      money$1(p.cuotaPeriodo)
                    ] }),
                    !p.activo && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "mt-1", children: "Pausado" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                    p.saldoPendiente > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "outline",
                        disabled: saving,
                        onClick: () => void togglePrestamoActivo(p, !p.activo),
                        children: p.activo ? "Pausar" : "Activar"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Button,
                      {
                        type: "button",
                        size: "sm",
                        variant: "ghost",
                        className: "text-destructive",
                        disabled: saving,
                        onClick: () => void removePrestamo(p),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
                      }
                    )
                  ] })
                ]
              },
              p.id
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Nuevo préstamo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Concepto" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    value: prestamoForm.concepto,
                    onChange: (e) => setPrestamoForm((f) => ({ ...f, concepto: e.target.value })),
                    placeholder: "Anticipo, adelanto..."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto total ($)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      min: 0,
                      step: "0.01",
                      value: prestamoForm.montoTotal,
                      onChange: (e) => setPrestamoForm((f) => ({ ...f, montoTotal: e.target.value }))
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cuota por periodo ($)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "number",
                      min: 0,
                      step: "0.01",
                      value: prestamoForm.cuotaPeriodo,
                      onChange: (e) => setPrestamoForm((f) => ({ ...f, cuotaPeriodo: e.target.value }))
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", onClick: () => void addPrestamo(), disabled: saving, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 mr-1" }),
                "Registrar préstamo"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPrestamoTarget(null), children: "Cerrar" }) })
        ] })
      }
    )
  ] });
}
const METODO_PAGO_LABEL = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  mixto: "Mixto"
};
function authHeaders() {
  const session = getStoredSession();
  if (!session) throw new Error("Sesión expirada");
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json"
  };
}
function mapResumen(raw) {
  return {
    fecha: String(raw.fecha),
    ventasPagadas: Number(raw.ventasPagadas),
    ventasPendientes: Number(raw.ventasPendientes),
    propinas: Number(raw.propinas),
    comandasPagadas: Number(raw.comandasPagadas),
    comandasPendientes: Number(raw.comandasPendientes),
    efectivoEsperado: Number(raw.efectivoEsperado),
    tarjetaTotal: Number(raw.tarjetaTotal),
    transferenciaTotal: Number(raw.transferenciaTotal),
    porMetodo: (raw.porMetodo ?? []).map((m) => ({
      metodo: String(m.metodo),
      total: Number(m.total),
      comandas: Number(m.comandas)
    })),
    corteCerrado: Boolean(raw.corteCerrado),
    corteId: raw.corteId != null ? String(raw.corteId) : void 0,
    efectivoContado: raw.efectivoContado != null ? Number(raw.efectivoContado) : void 0,
    diferencia: raw.diferencia != null ? Number(raw.diferencia) : void 0
  };
}
function mapCorte(raw) {
  return {
    id: String(raw.id),
    fecha: String(raw.fecha),
    totalVentas: Number(raw.totalVentas),
    totalPropinas: Number(raw.totalPropinas),
    efectivoEsperado: Number(raw.efectivoEsperado),
    tarjetaTotal: Number(raw.tarjetaTotal),
    transferenciaTotal: Number(raw.transferenciaTotal),
    efectivoContado: Number(raw.efectivoContado),
    diferencia: Number(raw.diferencia),
    comandasPagadas: Number(raw.comandasPagadas),
    comandasPendientes: Number(raw.comandasPendientes),
    notas: raw.notas != null ? String(raw.notas) : void 0,
    cerradoEn: Number(raw.cerradoEn),
    cerradoPorId: Number(raw.cerradoPorId),
    cerradoPorNombre: raw.cerradoPorNombre != null ? String(raw.cerradoPorNombre) : void 0
  };
}
async function fetchCajaResumen(fecha) {
  const q = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
  const res = await fetch(`${getApiUrl()}/api/caja/resumen${q}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapResumen(data);
}
async function fetchCajaComandas(opts) {
  const params = new URLSearchParams();
  if (opts?.fecha) params.set("fecha", opts.fecha);
  if (opts?.pagado != null) params.set("pagado", String(opts.pagado));
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${getApiUrl()}/api/caja/comandas${q}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data.map(mapComanda);
}
async function registrarPagoApi(comandaId, input) {
  const res = await fetch(`${getApiUrl()}/api/caja/pagos/${comandaId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapComanda(data);
}
async function anularPagoApi(comandaId) {
  const res = await fetch(`${getApiUrl()}/api/caja/pagos/${comandaId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapComanda(data);
}
async function crearCorteApi(input) {
  const res = await fetch(`${getApiUrl()}/api/caja/corte`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return mapCorte(data);
}
async function fetchCortes(limit = 30) {
  const res = await fetch(`${getApiUrl()}/api/caja/cortes?limit=${limit}`, { headers: authHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(parseApiError(data, res.status));
  return data.map(mapCorte);
}
function money(n) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function todayIso() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function AdminCaja() {
  const [fecha, setFecha] = reactExports.useState(todayIso());
  const [resumen, setResumen] = reactExports.useState(null);
  const [pendientes, setPendientes] = reactExports.useState([]);
  const [pagadas, setPagadas] = reactExports.useState([]);
  const [cortes, setCortes] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [cobrarId, setCobrarId] = reactExports.useState(null);
  const [metodo, setMetodo] = reactExports.useState("efectivo");
  const [propina, setPropina] = reactExports.useState("0");
  const [montoEfectivo, setMontoEfectivo] = reactExports.useState("");
  const [montoTarjeta, setMontoTarjeta] = reactExports.useState("");
  const [montoTransferencia, setMontoTransferencia] = reactExports.useState("");
  const [efectivoContado, setEfectivoContado] = reactExports.useState("");
  const [notasCorte, setNotasCorte] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const comandaCobrar = pendientes.find((c) => c.id === cobrarId);
  const totalCobrar = reactExports.useMemo(() => {
    if (!comandaCobrar) return 0;
    return comandaCobrar.total + (Number(propina) || 0);
  }, [comandaCobrar, propina]);
  const reload = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const [r, p, g, h] = await Promise.all([
        fetchCajaResumen(fecha),
        fetchCajaComandas({ fecha, pagado: false }),
        fetchCajaComandas({ fecha, pagado: true }),
        fetchCortes(20)
      ]);
      setResumen(r);
      setPendientes(p);
      setPagadas(g);
      setCortes(h);
      setEfectivoContado((prev) => prev === "" ? String(r.efectivoEsperado) : prev);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar caja");
    } finally {
      setLoading(false);
    }
  }, [fecha]);
  reactExports.useEffect(() => {
    setEfectivoContado("");
    void reload();
  }, [fecha, reload]);
  function openCobrar(c) {
    setCobrarId(c.id);
    setMetodo("efectivo");
    setPropina("0");
    setMontoEfectivo("");
    setMontoTarjeta("");
    setMontoTransferencia("");
  }
  async function confirmarPago() {
    if (!comandaCobrar) return;
    setSaving(true);
    try {
      const input = {
        metodoPago: metodo,
        propina: Number(propina) || 0,
        ...metodo === "mixto" ? {
          montoEfectivo: Number(montoEfectivo) || 0,
          montoTarjeta: Number(montoTarjeta) || 0,
          montoTransferencia: Number(montoTransferencia) || 0
        } : {}
      };
      await registrarPagoApi(comandaCobrar.id, input);
      toast.success(`Comanda #${comandaCobrar.folio} cobrada`);
      setCobrarId(null);
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cobrar");
    } finally {
      setSaving(false);
    }
  }
  async function handleAnular(c) {
    if (!confirm(`¿Anular el pago de la comanda #${c.folio}?`)) return;
    try {
      await anularPagoApi(c.id);
      toast.success("Pago anulado");
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo anular");
    }
  }
  async function handleCorte() {
    const contado = Number(efectivoContado);
    if (!Number.isFinite(contado) || contado < 0) {
      toast.error("Ingresa el efectivo contado en caja");
      return;
    }
    if (!confirm("¿Cerrar caja del día? No podrás modificar el corte.")) return;
    setSaving(true);
    try {
      await crearCorteApi({ fecha, efectivoContado: contado, notas: notasCorte.trim() || void 0 });
      toast.success("Corte de caja registrado");
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cerrar caja");
    } finally {
      setSaving(false);
    }
  }
  if (loading && !resumen) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-5 w-5 text-primary" }),
          "Caja"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cobros, métodos de pago y corte del día" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: fecha, onChange: (e) => setFecha(e.target.value), className: "w-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "icon", onClick: () => void reload(), disabled: loading, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: cn("h-4 w-4", loading && "animate-spin") }) })
      ] })
    ] }),
    resumen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Cobrado" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: money(resumen.ventasPagadas) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            resumen.comandasPagadas,
            " comanda(s)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Por cobrar" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-amber-600", children: money(resumen.ventasPendientes) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            resumen.comandasPendientes,
            " comanda(s)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Efectivo en caja" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: money(resumen.efectivoEsperado) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Incluye propinas en efectivo" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm text-muted-foreground", children: "Propinas" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", children: money(resumen.propinas) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Tarjeta ",
            money(resumen.tarjetaTotal),
            " · Transf. ",
            money(resumen.transferenciaTotal)
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "cobrar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full sm:w-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "cobrar", children: [
          "Por cobrar (",
          pendientes.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pagadas", children: [
          "Cobradas (",
          pagadas.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "corte", children: "Corte del día" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "historial", children: "Historial" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cobrar", className: "mt-4 space-y-3", children: pendientes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-muted-foreground", children: "No hay comandas pendientes de cobro en esta fecha." }) }) : pendientes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
            queueLabel(c.queueOrder),
            " · #",
            c.folio,
            " — ",
            c.cliente
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            c.mesa ?? "Sin mesa",
            " · ",
            c.items.length,
            " bebida(s) ·",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: c.status })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold", children: money(c.total) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => openCobrar(c), children: "Cobrar" })
        ] })
      ] }) }, c.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pagadas", className: "mt-4 space-y-3", children: pagadas.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-muted-foreground", children: "Sin cobros en esta fecha." }) }) : pagadas.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600" }),
            "#",
            c.folio,
            " — ",
            c.cliente
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            c.metodoPago ? METODO_PAGO_LABEL[c.metodoPago] : "—",
            c.propina ? ` · Propina ${money(c.propina)}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: money(c.montoPagado ?? c.total) }),
          !resumen?.corteCerrado && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => void handleAnular(c), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Undo2, { className: "h-4 w-4" }) })
        ] })
      ] }) }, c.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "corte", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "h-5 w-5" }),
            "Corte del día"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Cuenta el efectivo físico y cierra la caja. Todas las comandas del día deben estar cobradas." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: resumen?.corteCerrado ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/40 p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-green-700", children: "Caja cerrada" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
            "Efectivo esperado: ",
            money(resumen.efectivoEsperado),
            " · Contado:",
            " ",
            money(resumen.efectivoContado ?? 0)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "p",
            {
              className: cn(
                "text-sm font-semibold",
                (resumen.diferencia ?? 0) < 0 ? "text-red-600" : "text-green-700"
              ),
              children: [
                "Diferencia: ",
                money(resumen.diferencia ?? 0)
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Efectivo esperado" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", children: money(resumen?.efectivoEsperado ?? 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Tarjeta" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", children: money(resumen?.tarjetaTotal ?? 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Transferencia" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold", children: money(resumen?.transferenciaTotal ?? 0) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "efectivo-contado", children: "Efectivo contado en caja" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                id: "efectivo-contado",
                type: "number",
                min: 0,
                step: "0.01",
                value: efectivoContado,
                onChange: (e) => setEfectivoContado(e.target.value)
              }
            ),
            efectivoContado && resumen && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
              "Diferencia estimada:",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    "font-semibold",
                    Number(efectivoContado) - resumen.efectivoEsperado < 0 ? "text-red-600" : "text-green-700"
                  ),
                  children: money(Number(efectivoContado) - resumen.efectivoEsperado)
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "notas-corte", children: "Notas (opcional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { id: "notas-corte", value: notasCorte, onChange: (e) => setNotasCorte(e.target.value), rows: 2 })
          ] }),
          resumen && resumen.comandasPendientes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-amber-600", children: [
            "Faltan ",
            resumen.comandasPendientes,
            " comanda(s) por cobrar antes del corte."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              onClick: () => void handleCorte(),
              disabled: saving || (resumen?.comandasPendientes ?? 0) > 0,
              className: "gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-4 w-4" }),
                "Cerrar caja del día"
              ]
            }
          )
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "historial", className: "mt-4 space-y-3", children: cortes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-10 text-center text-muted-foreground", children: "Sin cortes registrados." }) }) : cortes.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: c.fecha }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
            c.comandasPagadas,
            " comandas · ",
            c.cerradoPorNombre ?? "Admin"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: money(c.totalVentas) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "p",
            {
              className: cn(
                "text-sm",
                c.diferencia < 0 ? "text-red-600" : c.diferencia > 0 ? "text-green-700" : "text-muted-foreground"
              ),
              children: [
                "Dif. ",
                money(c.diferencia)
              ]
            }
          )
        ] })
      ] }) }) }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!cobrarId, onOpenChange: (o) => !o && setCobrarId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Cobrar comanda #",
        comandaCobrar?.folio
      ] }) }),
      comandaCobrar && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          comandaCobrar.cliente,
          " · Total ",
          money(comandaCobrar.total)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Método de pago" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: metodo, onValueChange: (v) => setMetodo(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "efectivo", children: "Efectivo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "tarjeta", children: "Tarjeta" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "transferencia", children: "Transferencia" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "mixto", children: "Mixto" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Propina (opcional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, step: "0.01", value: propina, onChange: (e) => setPropina(e.target.value) })
        ] }),
        metodo === "mixto" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Efectivo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: montoEfectivo, onChange: (e) => setMontoEfectivo(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Tarjeta" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: montoTarjeta, onChange: (e) => setMontoTarjeta(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Transferencia" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                value: montoTransferencia,
                onChange: (e) => setMontoTransferencia(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "sm:col-span-3 text-xs text-muted-foreground", children: [
            "Debe sumar ",
            money(totalCobrar),
            " (total + propina)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-bold flex items-center gap-2", children: [
          metodo === "tarjeta" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-5 w-5" }),
          "A cobrar: ",
          money(totalCobrar)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setCobrarId(null), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => void confirmarPago(), disabled: saving, children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Confirmar cobro" })
      ] })
    ] }) })
  ] });
}
const Sheet = Root;
const SheetPortal = Portal;
const SheetOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = reactExports.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
    ] }),
    children
  ] })
] }));
SheetContent.displayName = Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = Title.displayName;
const SheetDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = Description.displayName;
const ADMIN_NAV = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "categorias", label: "Categorías", icon: LayoutGrid },
  { id: "menu", label: "Menú", icon: BookOpen },
  { id: "fases", label: "Fases", icon: Layers },
  { id: "adiciones", label: "Adiciones", icon: ListPlus },
  { id: "usuarios", label: "Usuarios", icon: UserCog },
  { id: "comandas", label: "Comandas", icon: ClipboardList },
  { id: "caja", label: "Caja", icon: Banknote },
  { id: "reportes", label: "Reportes", icon: ChartColumn },
  { id: "nomina", label: "Nómina", icon: Wallet },
  { id: "inventario", label: "Inventario", icon: Boxes },
  { id: "mesas", label: "Mesas", icon: Users },
  { id: "pos", label: "Nuevo pedido", icon: UtensilsCrossed }
];
const ADMIN_NAV_GROUPS = [
  { label: "General", ids: ["resumen", "reportes"] },
  { label: "Menú", ids: ["categorias", "menu", "fases", "adiciones"] },
  { label: "Operación", ids: ["comandas", "caja", "inventario", "mesas", "pos"] },
  { label: "Equipo", ids: ["usuarios", "nomina"] }
];
const ADMIN_MOBILE_QUICK = [
  { id: "resumen", label: "Inicio", icon: LayoutDashboard },
  { id: "menu", label: "Menú", icon: BookOpen },
  { id: "comandas", label: "Comandas", icon: ClipboardList },
  { id: "more", label: "Más", icon: Menu }
];
function adminNavLabel(id) {
  return ADMIN_NAV.find((n) => n.id === id)?.label ?? id;
}
function AdminMobileHeader({
  section,
  onOpenMenu,
  userName,
  onLogout
}) {
  const current = ADMIN_NAV.find((n) => n.id === section);
  const Icon2 = current?.icon ?? Beer;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "md:hidden sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 pt-[env(safe-area-inset-top)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onOpenMenu,
        className: "flex items-center gap-3 min-w-0 flex-1 text-left touch-manipulation active:opacity-80",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate", children: adminNavLabel(section) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: userName })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "button",
        variant: "outline",
        size: "icon",
        className: "shrink-0 h-10 w-10",
        onClick: onLogout,
        "aria-label": "Cerrar sesión",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" })
      }
    )
  ] }) });
}
function AdminMobileNav({
  section,
  onSectionChange,
  userName,
  onLogout,
  sheetOpen,
  onSheetOpenChange
}) {
  function pick(id) {
    onSectionChange(id);
    onSheetOpenChange(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Sheet, { open: sheetOpen, onOpenChange: onSheetOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SheetContent, { side: "left", className: "w-[min(100vw-2rem,20rem)] p-0 flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SheetHeader, { className: "p-4 border-b text-left space-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Beer, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTitle, { className: "text-base", children: "Michelandia" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-normal truncate", children: userName })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto p-3 space-y-4", children: ADMIN_NAV_GROUPS.map((group) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-2 mb-1.5", children: group.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5", children: group.ids.map((id) => {
          const item = ADMIN_NAV.find((n) => n.id === id);
          if (!item) return null;
          const Icon2 = item.icon;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => pick(id),
              className: cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium touch-manipulation transition-colors",
                section === id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: "h-5 w-5 shrink-0" }),
                item.label
              ]
            },
            id
          );
        }) })
      ] }, group.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 border-t pb-[max(0.75rem,env(safe-area-inset-bottom))]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full gap-2 h-11", onClick: onLogout, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
        "Salir"
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "nav",
      {
        className: "md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/90 pb-[env(safe-area-inset-bottom)]",
        "aria-label": "Navegación principal",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4", children: ADMIN_MOBILE_QUICK.map((item) => {
          const Icon2 = item.icon;
          const active = item.id === "more" ? sheetOpen : section === item.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                if (item.id === "more") {
                  onSheetOpenChange(true);
                } else {
                  onSectionChange(item.id);
                  onSheetOpenChange(false);
                }
              },
              className: cn(
                "flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 touch-manipulation min-h-[3.25rem] transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: cn("h-5 w-5", active && "stroke-[2.5]") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium leading-none", children: item.label })
              ]
            },
            item.id
          );
        }) })
      }
    )
  ] });
}
const STATUS_META = {
  pendiente: { label: "Pendiente", cls: "bg-accent text-accent-foreground", icon: Clock },
  lista: { label: "Lista", cls: "bg-secondary text-secondary-foreground", icon: Package },
  entregada: { label: "Entregada", cls: "bg-muted text-muted-foreground", icon: Check }
};
function ComandasList() {
  const { productos } = useMenu();
  const { comandas, updateStatus, remove } = useComandas();
  if (comandas.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-10 w-10 mx-auto mb-3 opacity-50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Sin comandas todavía. Toma el primer pedido del día." })
    ] });
  }
  const sorted = [...comandas].sort(sortComandasByQueue);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: sorted.map((c) => {
    const meta = STATUS_META[c.status];
    const Icon2 = meta.icon;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-lg flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-bold px-2 py-0.5 tabular-nums", children: queueLabel(c.queueOrder) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "#",
              c.folio,
              " · ",
              c.cliente
            ] }),
            c.mesa && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-normal text-muted-foreground", children: [
              " · ",
              c.mesa
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: meta.cls, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: "h-3 w-3 mr-1" }),
            meta.label
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: new Date(c.createdAt).toLocaleTimeString() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2 text-sm", children: c.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "border-l-2 border-primary/40 pl-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: it.micheladaName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "$",
              it.total
            ] })
          ] }),
          it.selectedToppings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "+",
            " ",
            faseOpcionNames(it.micheladaId, it.selectedToppings, productos).join(", ")
          ] }),
          it.additions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Adiciones: ",
            it.additions.map((a) => a.name).join(", ")
          ] }),
          it.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs italic text-muted-foreground", children: [
            '"',
            it.notes,
            '"'
          ] })
        ] }, it.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-lg", children: [
            "$",
            c.total
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ComandaViewDialog, { comanda: c }),
          c.status === "pendiente" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => void updateStatus(c.id, "lista"), children: "Marcar lista" }),
          c.status === "lista" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: () => void updateStatus(c.id, "entregada"), children: "Entregar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => printComanda(c, productos), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "h-4 w-4 mr-1" }),
            " Ticket"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => void remove(c.id),
              className: "text-destructive hover:text-destructive",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
            }
          )
        ] })
      ] })
    ] }, c.id);
  }) });
}
const ESTADO_META = {
  libre: { label: "Libre", cls: "bg-secondary text-secondary-foreground" },
  ocupada: { label: "Ocupada", cls: "bg-primary text-primary-foreground" },
  reservada: { label: "Reservada", cls: "bg-accent text-accent-foreground" }
};
const STATUS_ICON = { pendiente: Clock, lista: Package, entregada: Check };
function MesasPanel() {
  const { mesas, addMesa, updateMesa, removeMesa, resetMesas } = useMesas();
  const { comandas, reassignMesa, updateStatus } = useComandas();
  const [nombre, setNombre] = reactExports.useState("");
  const [capacidad, setCapacidad] = reactExports.useState(4);
  const [reassign, setReassign] = reactExports.useState(null);
  const [reassignMesaId, setReassignMesaId] = reactExports.useState("");
  const activos = reactExports.useMemo(
    () => comandas.filter((c) => c.status !== "entregada"),
    [comandas]
  );
  const comandasByMesa = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    activos.forEach((c) => {
      const key = c.mesa || "__sin__";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    return map;
  }, [activos]);
  function handleAdd() {
    if (!nombre.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    addMesa(nombre.trim(), capacidad);
    setNombre("");
    setCapacidad(4);
    toast.success("Mesa agregada");
  }
  function openReassign(c) {
    setReassign(c);
    setReassignMesaId(c.mesa || "__none__");
  }
  function confirmReassign() {
    if (!reassign) return;
    const mesaId = reassignMesaId === "__none__" ? void 0 : reassignMesaId;
    const mesaNombre = mesaId ? mesas.find((m) => m.id === mesaId)?.nombre : void 0;
    reassignMesa(reassign.id, mesaNombre);
    if (mesaId) updateMesa(mesaId, { estado: "ocupada", cliente: reassign.cliente });
    toast.success(`Comanda #${reassign.folio} reasignada`);
    setReassign(null);
  }
  const sinAsignar = comandasByMesa.get("__sin__") || [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-5 w-5 text-primary" }),
        " Agregar mesa"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[180px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "mesa-nombre", children: "Nombre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "mesa-nombre",
              value: nombre,
              onChange: (e) => setNombre(e.target.value),
              placeholder: "Mesa 6, Terraza 1...",
              maxLength: 30
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-32", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "mesa-cap", children: "Capacidad" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "mesa-cap",
              type: "number",
              min: 0,
              max: 20,
              value: capacidad,
              onChange: (e) => setCapacidad(Number(e.target.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAdd, children: "Agregar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: resetMesas, className: "ml-auto", children: "Restaurar mesas" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }),
        " Mesas (",
        mesas.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: mesas.map((m) => {
        const meta = ESTADO_META[m.estado];
        const pedidos = activos.filter((c) => c.mesa === m.nombre);
        const totalMesa = pedidos.reduce((s, c) => s + c.total, 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: m.nombre }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Capacidad: ",
                m.capacidad,
                m.cliente && ` · ${m.cliente}`
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: meta.cls, children: meta.label })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: m.estado,
                onValueChange: (v) => updateMesa(m.id, {
                  estado: v,
                  cliente: v === "libre" ? void 0 : m.cliente
                }),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "libre", children: "Libre" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "ocupada", children: "Ocupada" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "reservada", children: "Reservada" })
                  ] })
                ]
              }
            ),
            pedidos.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: pedidos.map((c) => {
                const Icon2 = STATUS_ICON[c.status];
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "li",
                  {
                    className: "rounded-md border bg-muted/30 p-2 text-sm",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium flex items-center gap-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: "h-3 w-3" }),
                          " #",
                          c.folio
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                          "$",
                          c.total
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                        c.items.length,
                        " bebida(s) · ",
                        c.cliente
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mt-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          Button,
                          {
                            size: "sm",
                            variant: "outline",
                            className: "h-7 text-xs",
                            onClick: () => openReassign(c),
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Move, { className: "h-3 w-3 mr-1" }),
                              " Mover"
                            ]
                          }
                        ),
                        c.status === "pendiente" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            size: "sm",
                            variant: "ghost",
                            className: "h-7 text-xs",
                            onClick: () => void updateStatus(c.id, "lista"),
                            children: "Lista"
                          }
                        ),
                        c.status === "lista" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Button,
                          {
                            size: "sm",
                            variant: "ghost",
                            className: "h-7 text-xs",
                            onClick: () => void updateStatus(c.id, "entregada"),
                            children: "Entregar"
                          }
                        )
                      ] })
                    ]
                  },
                  c.id
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-semibold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total mesa" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "$",
                  totalMesa
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-2", children: "Sin pedidos activos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "w-full text-destructive hover:text-destructive",
                onClick: () => removeMesa(m.id),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-1" }),
                  " Eliminar"
                ]
              }
            )
          ] })
        ] }, m.id);
      }) })
    ] }),
    sinAsignar.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-accent", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
        "Pedidos sin mesa asignada (",
        sinAsignar.length,
        ")"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-2", children: sinAsignar.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center justify-between rounded-md border p-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
                "#",
                c.folio,
                " · ",
                c.cliente
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                c.items.length,
                " bebida(s) · $",
                c.total
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => openReassign(c), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Move, { className: "h-4 w-4 mr-1" }),
              " Asignar mesa"
            ] })
          ]
        },
        c.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!reassign, onOpenChange: (o) => !o && setReassign(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Reasignar comanda #",
        reassign?.folio
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mesa destino" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: reassignMesaId, onValueChange: setReassignMesaId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecciona una mesa" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Sin mesa" }),
            mesas.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: m.id, children: [
              m.nombre,
              " · ",
              ESTADO_META[m.estado].label
            ] }, m.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setReassign(null), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: confirmReassign, children: "Confirmar" })
      ] })
    ] }) })
  ] });
}
const ScrollArea = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root$1,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Viewport$1, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollBar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Corner, {})
    ]
  }
));
ScrollArea.displayName = Root$1.displayName;
const ScrollBar = reactExports.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;
function OrderBuilder() {
  const { productos, adiciones, faseOpciones } = useMenu();
  const [selectedId, setSelectedId] = reactExports.useState("");
  const [toppings, setToppings] = reactExports.useState([]);
  const [additions, setAdditions] = reactExports.useState([]);
  const [notes, setNotes] = reactExports.useState("");
  const [cliente, setCliente] = reactExports.useState("");
  const [mesaId, setMesaId] = reactExports.useState("__none__");
  const [cart, setCart] = reactExports.useState([]);
  const activeId = selectedId || productos[0]?.id || "";
  const michelada = productos.find((m) => m.id === activeId);
  const { addComanda } = useComandas();
  const { decrementBatch, reload: reloadInventario } = useInventory();
  const { mesas } = useMesas();
  const selectedAdditions = reactExports.useMemo(
    () => adiciones.filter((a) => additions.includes(a.id)).map(({ id, name, price }) => ({ id, name, price })),
    [adiciones, additions]
  );
  const currentTotal = michelada ? calcItemTotal(michelada.price, selectedAdditions) : 0;
  const cartTotal = cart.reduce((s, i) => s + i.total, 0);
  function resetBuilder() {
    setToppings([]);
    setAdditions([]);
    setNotes("");
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
      total: currentTotal
    };
    setCart((c) => [...c, item]);
    resetBuilder();
    toast.success(`${michelada.name} agregada`);
  }
  async function sendOrder() {
    if (cart.length === 0) {
      toast.error("Agrega al menos una michelada");
      return;
    }
    const nombre = cliente.trim() || "Cliente";
    const mesa = mesaId !== "__none__" ? mesas.find((m) => m.id === mesaId)?.nombre : void 0;
    try {
      const c = await addComanda({
        cliente: nombre,
        mesaId: mesaId !== "__none__" ? mesaId : void 0,
        mesa,
        items: cart,
        total: cartTotal
      });
      if (!getStoredSession()) {
        decrementBatch(buildOrderDeductions(cart, adiciones, productos, faseOpciones));
      } else {
        void reloadInventario();
      }
      printComandaOnSend(c, productos);
      toast.success(
        `${c.queueOrder ? `Turno ${c.queueOrder} · ` : ""}Comanda #${c.folio} enviada. Ticket impreso.`
      );
      setCart([]);
      setCliente("");
      setMesaId("__none__");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar");
    }
  }
  if (!michelada) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground py-12", children: "Cargando menú…" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_380px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Beer, { className: "h-5 w-5 text-primary" }),
          " Elige el tipo"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "grid gap-3 sm:grid-cols-2", children: productos.map((m) => {
          const active = m.id === activeId;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setSelectedId(m.id);
                setToppings([]);
              },
              className: `text-left rounded-xl border p-4 transition-all ${active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/40 hover:bg-muted"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: m.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: m.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
                  "$",
                  m.price
                ] })
              ] })
            },
            m.id
          );
        }) })
      ] }),
      michelada.faseOpciones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { children: [
          "Fases — ",
          michelada.name
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: Array.from(
          michelada.faseOpciones.reduce((map, op) => {
            const list = map.get(op.faseId) ?? [];
            list.push(op);
            map.set(op.faseId, list);
            return map;
          }, /* @__PURE__ */ new Map())
        ).map(([faseId, opciones]) => {
          const faseName = fases.find((f) => f.id === faseId)?.name ?? opciones[0]?.faseName ?? faseId;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground mb-2", children: faseName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: opciones.map((t) => {
              const checked = toppings.includes(t.id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setToppings(
                    (cur) => cur.includes(t.id) ? cur.filter((x) => x !== t.id) : [...cur, t.id]
                  ),
                  className: `px-3 py-2 rounded-full border text-sm transition ${checked ? "bg-secondary border-secondary text-secondary-foreground" : "border-border hover:bg-muted"}`,
                  children: [
                    checked ? "✓ " : "+ ",
                    t.name
                  ]
                },
                t.id
              );
            }) })
          ] }, faseId);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Adiciones" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "grid sm:grid-cols-2 gap-2", children: adiciones.map((a) => {
          const checked = additions.includes(a.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "label",
            {
              className: `flex items-center justify-between gap-2 rounded-lg border px-3 py-2 cursor-pointer ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Checkbox,
                    {
                      checked,
                      onCheckedChange: () => setAdditions(
                        (cur) => cur.includes(a.id) ? cur.filter((x) => x !== a.id) : [...cur, a.id]
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: a.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", children: [
                  "+$",
                  a.price
                ] })
              ]
            },
            a.id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { children: "Notas para barra" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: notes,
            onChange: (e) => setNotes(e.target.value),
            placeholder: "Sin hielo, extra picante, etc.",
            maxLength: 200
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Total de esta michelada" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold", children: [
            "$",
            currentTotal
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", onClick: addToCart, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Agregar al pedido"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "lg:sticky lg:top-4 self-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-5 w-5" }),
        " Pedido actual"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "cliente", children: "Cliente" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "cliente",
              value: cliente,
              onChange: (e) => setCliente(e.target.value),
              placeholder: "Nombre del cliente",
              maxLength: 40
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mesa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mesaId, onValueChange: setMesaId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Sin asignar" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Sin asignar" }),
              mesas.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: m.id, children: [
                m.nombre,
                " ",
                m.estado !== "libre" ? `· ${m.estado}` : ""
              ] }, m.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        cart.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "Aún no hay micheladas en el pedido" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollArea, { className: "max-h-[340px] pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: cart.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "rounded-lg border p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: it.micheladaName }),
            it.selectedToppings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              "Fases:",
              " ",
              faseOpcionNames(it.micheladaId, it.selectedToppings, productos).join(
                ", "
              )
            ] }),
            it.additions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Adiciones: ",
              it.additions.map((a) => a.name).join(", ")
            ] }),
            it.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs italic text-muted-foreground mt-1", children: [
              '"',
              it.notes,
              '"'
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
              "$",
              it.total
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => setCart((c) => c.filter((x) => x.id !== it.id)),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }) }, it.id)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold", children: [
            "$",
            cartTotal
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", size: "lg", onClick: () => void sendOrder(), children: "Enviar pedido y generar comanda" })
      ] })
    ] })
  ] });
}
function AdminPanel() {
  const {
    user
  } = Route$1.useRouteContext();
  const navigate = useNavigate();
  const [section, setSection] = reactExports.useState("resumen");
  const [navSheetOpen, setNavSheetOpen] = reactExports.useState(false);
  function handleLogout() {
    clearSession();
    void navigate({
      to: "/login"
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", richColors: true }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex w-56 shrink-0 border-r bg-card flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Beer, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-sm truncate", children: "Admin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: user.nombre })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-2 space-y-1 overflow-y-auto", children: ADMIN_NAV.map((item) => {
        const Icon2 = item.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSection(item.id), className: cn("w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors", section === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: "h-4 w-4 shrink-0" }),
          item.label
        ] }, item.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 border-t", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "w-full gap-2", onClick: handleLogout, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4" }),
        "Salir"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AdminMobileHeader, { section, onOpenMenu: () => setNavSheetOpen(true), userName: user.nombre, onLogout: handleLogout }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AdminMobileNav, { section, onSectionChange: setSection, userName: user.nombre, onLogout: handleLogout, sheetOpen: navSheetOpen, onSheetOpenChange: setNavSheetOpen }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 px-3 pt-3 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:px-6 md:py-6 md:pb-6 overflow-auto max-w-6xl w-full mx-auto", children: [
        section === "resumen" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminDashboard, {}),
        section === "categorias" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminCategorias, {}),
        section === "menu" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminMenu, {}),
        section === "fases" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminFases, {}),
        section === "adiciones" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminAdiciones, {}),
        section === "usuarios" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminUsers, {}),
        section === "comandas" && /* @__PURE__ */ jsxRuntimeExports.jsx(ComandasList, {}),
        section === "caja" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminCaja, {}),
        section === "reportes" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminReportes, {}),
        section === "nomina" && /* @__PURE__ */ jsxRuntimeExports.jsx(AdminNomina, {}),
        section === "inventario" && /* @__PURE__ */ jsxRuntimeExports.jsx(InventoryPanel, {}),
        section === "mesas" && /* @__PURE__ */ jsxRuntimeExports.jsx(MesasPanel, {}),
        section === "pos" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Tomar pedido" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Mismo flujo que el mesero" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(OrderBuilder, {})
        ] })
      ] })
    ] })
  ] }) });
}
export {
  AdminPanel as component
};
