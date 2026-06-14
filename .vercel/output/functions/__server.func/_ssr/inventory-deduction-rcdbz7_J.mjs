import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as useInventory, E as getStoredSession, c as cn } from "./router-DZCtlrU8.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { R as Root2, P as Portal2, C as Content2, T as Title2, D as Description2, a as Cancel, A as Action, O as Overlay2 } from "../_libs/radix-ui__react-alert-dialog.mjs";
import { B as Button, b as buttonVariants } from "./button-DTleohOI.mjs";
import { C as Card, d as CardHeader, e as CardTitle, B as Badge, f as CardContent } from "./tabs-DWCuvaLX.mjs";
import { I as Input } from "./label-Cb3eUA4_.mjs";
import { L as LoaderCircle, r as Boxes, R as RefreshCw, a0 as RotateCcw, T as TriangleAlert, x as Trash2 } from "../_libs/lucide-react.mjs";
const AlertDialog = Root2;
const AlertDialogPortal = Portal2;
const AlertDialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay2,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = Overlay2.displayName;
const AlertDialogContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = Content2.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title2,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = Title2.displayName;
const AlertDialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description2,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = Description2.displayName;
const AlertDialogAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = Action.displayName;
const AlertDialogCancel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = Cancel.displayName;
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const FASE_PASO_PREFIX = "fase:";
const PASO_NOTAS = "notas";
const LEGACY_PASO_TOPPINGS = "toppings";
function fasePasoId(faseId) {
  return `${FASE_PASO_PREFIX}${faseId}`;
}
function parseFaseIdFromPaso(paso) {
  if (paso.startsWith(FASE_PASO_PREFIX)) return paso.slice(FASE_PASO_PREFIX.length);
  if (paso === LEGACY_PASO_TOPPINGS) return "topping";
  return null;
}
function isFasePaso(paso) {
  return parseFaseIdFromPaso(paso) !== null;
}
function normalizeProductPasos(pasos, faseIds) {
  if (!pasos?.length) {
    const ids = faseIds.length ? faseIds : ["topping"];
    return [...ids.map(fasePasoId), PASO_NOTAS];
  }
  const valid = new Set(faseIds);
  const out = [];
  for (const p of pasos) {
    if (p === PASO_NOTAS) out.push(PASO_NOTAS);
    else if (p === LEGACY_PASO_TOPPINGS) out.push(fasePasoId("topping"));
    else if (p.startsWith(FASE_PASO_PREFIX)) {
      const fid = parseFaseIdFromPaso(p);
      if (fid && (!valid.size || valid.has(fid))) out.push(fasePasoId(fid));
    }
  }
  if (!out.some((x) => x.startsWith(FASE_PASO_PREFIX))) {
    const ids = faseIds.length ? faseIds : ["topping"];
    out.unshift(...ids.map(fasePasoId));
  }
  if (!out.includes(PASO_NOTAS)) out.push(PASO_NOTAS);
  return out;
}
function opcionesForFase(producto, faseId) {
  return producto.faseOpciones.filter((o) => o.faseId === faseId);
}
function InventoryPanel() {
  const { items, loading, error, reload, setStock, reset, removeItem } = useInventory();
  const [savingKey, setSavingKey] = reactExports.useState(null);
  const [resetting, setResetting] = reactExports.useState(false);
  const [deleting, setDeleting] = reactExports.useState(false);
  const [deleteTarget, setDeleteTarget] = reactExports.useState(null);
  const isAdmin = getStoredSession()?.user.rol === "admin";
  async function handleStockChange(key, value) {
    setSavingKey(key);
    try {
      await setStock(key, value);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSavingKey(null);
    }
  }
  async function handleReset() {
    if (!confirm("¿Restaurar todo el inventario a los valores iniciales?")) return;
    setResetting(true);
    try {
      await reset();
      toast.success("Inventario restaurado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo reiniciar");
    } finally {
      setResetting(false);
    }
  }
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeItem(deleteTarget.key);
      toast.success(`"${deleteTarget.name}" eliminado del inventario`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  }
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-16 gap-3 text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Cargando inventario…" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Inventario" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Stock de insumos y descuentos por comanda" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-3 sm:p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: getStoredSession() ? "Sincronizado con la base de datos. Se descuenta al enviar cada comanda a barra." : "Modo local: los cambios se guardan en este navegador." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: cn(
            "grid gap-2 sm:flex sm:justify-end sm:shrink-0",
            isAdmin ? "grid-cols-2" : "grid-cols-1"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                className: "min-h-11 touch-manipulation gap-2",
                onClick: () => void reload(),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 shrink-0" }),
                  "Actualizar"
                ]
              }
            ),
            isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "outline",
                className: "min-h-11 touch-manipulation gap-2",
                onClick: () => void handleReset(),
                disabled: resetting,
                children: [
                  resetting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 shrink-0 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4 shrink-0" }),
                  "Reiniciar"
                ]
              }
            )
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2", children: error }),
    items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-12 rounded-xl border border-dashed", children: "Sin ítems en inventario" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: items.map((i) => {
      const min = i.minStock ?? 5;
      const low = i.stock <= min;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: low ? "border-destructive/50 bg-destructive/[0.02]" : "", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2 px-4 pt-4 sm:px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "leading-snug", children: i.name }),
            low && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "destructive", className: "gap-1 shrink-0 text-[10px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
              "Bajo"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground font-mono truncate", children: i.key }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Mínimo: ",
            min,
            " ",
            i.unit
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3 px-4 pb-4 sm:px-6 sm:pb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                min: 0,
                step: "any",
                inputMode: "decimal",
                value: i.stock,
                disabled: !isAdmin || savingKey === i.key,
                onChange: (e) => void handleStockChange(i.key, Math.max(0, Number(e.target.value) || 0)),
                className: "flex-1 min-w-0 h-11 text-base sm:text-sm sm:max-w-[7rem]"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-muted-foreground shrink-0 w-8", children: i.unit }),
            savingKey === i.key && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground shrink-0" })
          ] }),
          isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              className: "w-full min-h-11 gap-2 touch-manipulation text-destructive hover:text-destructive hover:bg-destructive/10",
              disabled: deleting,
              onClick: () => setDeleteTarget({ key: i.key, name: i.name }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }),
                "Eliminar"
              ]
            }
          )
        ] })
      ] }, i.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlertDialog,
      {
        open: deleteTarget !== null,
        onOpenChange: (open) => !open && setDeleteTarget(null),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "¿Eliminar ítem de inventario?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
              "Se quitará ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: deleteTarget?.name }),
              " (",
              deleteTarget?.key,
              "). Se borrará su consumo en productos y se limpiará la clave en adiciones que la usen. Esta acción no se puede deshacer."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { disabled: deleting, children: "Cancelar" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                disabled: deleting,
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
function add(totals, key, qty) {
  if (!key || qty <= 0) return;
  totals[key] = (totals[key] ?? 0) + qty;
}
const MICHELADA_BASES = ["ginger", "soda", "cerveza", "cola_pola", "smirnoff"];
function bebidaBaseFromProductoId(productoId) {
  for (const base of MICHELADA_BASES) {
    if (productoId.endsWith(`_${base}`)) return base;
  }
  return null;
}
function defaultProductConsumo(productoId) {
  const bebida = bebidaBaseFromProductoId(productoId);
  if (bebida) {
    return [
      { clave: bebida, cantidad: 1 },
      { clave: "limon", cantidad: 2 }
    ];
  }
  const lines = [
    { clave: "cerveza", cantidad: 1 },
    { clave: "limon", cantidad: 2 }
  ];
  if (productoId.startsWith("cubana")) {
    lines.push({ clave: "clamato", cantidad: 0.2 });
  }
  return lines;
}
function consumoForProduct(producto, productoId) {
  if (producto?.consumo?.length) return producto.consumo;
  return defaultProductConsumo(productoId);
}
function opcionDeduction(opcionId, catalog) {
  const op = catalog.find((o) => o.id === opcionId);
  if (op?.stockKey) return { key: op.stockKey, qty: op.cantidad ?? 1 };
  if (catalog.some((o) => o.id === opcionId)) return null;
  return { key: opcionId, qty: 1 };
}
function buildOrderDeductions(cart, adicionesCatalog, productos, faseCatalog) {
  const totals = {};
  for (const it of cart) {
    const producto = productos.find((p) => p.id === it.micheladaId);
    const productOpciones = producto?.faseOpciones ?? [];
    const allOpciones = [...faseCatalog, ...productOpciones];
    for (const line of consumoForProduct(producto, it.micheladaId)) {
      add(totals, line.clave, line.cantidad);
    }
    for (const opcionId of it.selectedToppings) {
      const d = opcionDeduction(opcionId, allOpciones);
      if (d) add(totals, d.key, d.qty);
    }
    for (const a of it.additions) {
      const def = adicionesCatalog.find((d) => d.id === a.id);
      const key = def?.stockKey ?? a.id;
      const qty = def?.cantidad ?? 1;
      add(totals, key, qty);
    }
  }
  return totals;
}
export {
  AlertDialog as A,
  InventoryPanel as I,
  PASO_NOTAS as P,
  Textarea as T,
  AlertDialogContent as a,
  AlertDialogHeader as b,
  AlertDialogTitle as c,
  AlertDialogDescription as d,
  AlertDialogFooter as e,
  fasePasoId as f,
  AlertDialogCancel as g,
  AlertDialogAction as h,
  isFasePaso as i,
  buildOrderDeductions as j,
  normalizeProductPasos as n,
  opcionesForFase as o,
  parseFaseIdFromPaso as p
};
