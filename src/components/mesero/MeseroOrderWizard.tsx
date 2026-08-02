import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import {
  MeseroStepHeader,
  MichelandiaFooterBar,
  ThemedPanel,
  ThemedPanelHeader,
} from "@/components/michelandia/michelandia-ui";
import { QuantityStepper } from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ComandaViewDialog } from "@/components/ComandaViewDialog";
import { MeseroListasBanner } from "@/components/mesero/MeseroListasBanner";
import { MeseroPasoCategoria } from "@/components/mesero/MeseroPasoCategoria";
import { MeseroPasoProducto, type ProductPick } from "@/components/mesero/MeseroPasoProducto";
import { MeseroPasoCliente } from "@/components/mesero/MeseroPasoCliente";
import { MeseroPasoCarrito } from "@/components/mesero/MeseroPasoCarrito";
import { MeseroPasoFase } from "@/components/mesero/MeseroPasoFase";
import { MeseroPasoMesa } from "@/components/mesero/MeseroPasoMesa";
import { useMeseroComandaAlerts } from "@/hooks/use-mesero-comanda-alerts";
import { sendToBarraAndOpenTicket } from "@/lib/send-to-barra";
import {
  clearMeseroFreshStart,
  consumeMeseroCartRestore,
  shouldForceMeseroFreshStart,
} from "@/lib/ticket-print-session";
import { isFasePaso, opcionesForFase, parseFaseIdFromPaso } from "@/lib/fases";
import { getStoredSession } from "@/lib/auth";
import { getComandasListas, getMesaActivity, isMesaVirtual } from "@/lib/pos-utils";
import { useMenu } from "@/lib/menu-context";
import {
  calcItemLineTotal,
  formatAdditionLine,
  isParaLlevar,
  LLEVAR_EXTRA,
  llevarExtraPorUnidad,
  MESA_LLEVAR_ID,
  orderItemQuantity,
  useComandas,
  useInventory,
  useMesas,
  type Comanda,
  type OrderItem,
} from "@/lib/micheladas-store";
import {
  buildBatchMeseroSteps,
  buildMeseroSteps,
  cervezaOpcionesForProduct,
  CERVEZA_FASE_ID,
  getMeseroStepLabel,
  isCervezaProduct,
  type MeseroFlowStep,
} from "@/lib/product-steps";
import { formatMenuPrice } from "@/lib/michelandia-theme";
import { cn } from "@/lib/utils";

const TOUCH_BTN =
  "touch-manipulation active:scale-[0.98] transition-transform min-h-[3rem]";

export function MeseroOrderWizard() {
  const { categorias, productos, adiciones, fases, faseOpciones, loading: menuLoading } = useMenu();
  const { comandas, addComanda, updateStatus, reload: reloadComandas } = useComandas();
  const { decrementBatch, reload: reloadInventario } = useInventory();
  const { mesas, loading: mesasLoading, reload: reloadMesas, marcarAtendida } = useMesas();
  const meseroId = getStoredSession()?.user.id;

  useMeseroComandaAlerts(comandas);

  const [currentStep, setCurrentStep] = useState<MeseroFlowStep>("mesa");
  const [mesaDetalleId, setMesaDetalleId] = useState<string | null>(null);
  const [cliente, setCliente] = useState("");
  const [mesaId, setMesaId] = useState("");
  /** Mesa previa al activar "para llevar" desde el carrito (para poder revertir). */
  const mesaAntesDeLlevarRef = useRef("");
  const [selectedCategoriaIds, setSelectedCategoriaIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [productPicks, setProductPicks] = useState<ProductPick[]>([]);
  /** Tipo de cerveza elegido en el paso producto (productId → opción). */
  const [draftCervezaById, setDraftCervezaById] = useState<Record<string, string>>({});
  /** Productos elegidos pendientes de agregar al carrito. */
  const [batchPicks, setBatchPicks] = useState<ProductPick[]>([]);
  /** Toppings/fases ya resueltos por producto dentro del lote. */
  const [batchToppingsById, setBatchToppingsById] = useState<Record<string, string[]>>({});
  /** Adiciones elegidas por producto (id de producto → picks). */
  const [batchAdditionsById, setBatchAdditionsById] = useState<
    Record<string, { id: string; quantity: number }[]>
  >({});
  /** Cola de productos que aún necesitan elegir fases. */
  const [faseQueue, setFaseQueue] = useState<ProductPick[]>([]);
  const [toppings, setToppings] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [sending, setSending] = useState(false);

  function resetCompletedOrder() {
    setCart([]);
    setCliente("");
    setMesaId("");
    setMesaDetalleId(null);
    setSelectedCategoriaIds([]);
    setSelectedId("");
    setProductPicks([]);
    setDraftCervezaById({});
    setBatchPicks([]);
    setBatchToppingsById({});
    setBatchAdditionsById({});
    setFaseQueue([]);
    setToppings([]);
    setNotes("");
    setItemQuantity(1);
    setSending(false);
    setCurrentStep("mesa");
  }

  useEffect(() => {
    if (shouldForceMeseroFreshStart()) {
      resetCompletedOrder();
      return;
    }
    const restored = consumeMeseroCartRestore();
    if (!restored) return;
    setCart(restored.cart);
    setCliente(restored.cliente);
    setMesaId(restored.mesaId);
    if (restored.cart.length > 0) setCurrentStep("carrito");
  }, []);

  // Si el mesero usa "atrás" del navegador (bfcache), no reabrir el pedido ya enviado.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && shouldForceMeseroFreshStart()) {
        resetCompletedOrder();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const categoriasActivas = useMemo(
    () => categorias.filter((c) => c.activo !== false && c.productos.length > 0),
    [categorias],
  );
  const categoriasSeleccionadas = useMemo(
    () => categoriasActivas.filter((c) => selectedCategoriaIds.includes(c.id)),
    [categoriasActivas, selectedCategoriaIds],
  );
  const michelada = productos.find((m) => m.id === selectedId);
  const faseIds = useMemo(() => fases.map((f) => f.id), [fases]);
  const inBatch = batchPicks.length > 0;
  const steps = useMemo(() => {
    if (inBatch) return buildBatchMeseroSteps(michelada, faseIds);
    return buildMeseroSteps(michelada?.pasos, michelada, faseIds);
  }, [inBatch, michelada, faseIds]);
  const stepIndex = Math.max(0, steps.indexOf(currentStep));
  const step = steps[stepIndex] ?? currentStep;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  function resolveAdditions(
    picks: { id: string; quantity: number }[] | undefined,
  ): OrderItem["additions"] {
    if (!picks?.length) return [];
    return picks
      .map((pick) => {
        const a = adiciones.find((x) => x.id === pick.id);
        if (!a) return null;
        return { id: a.id, name: a.name, price: a.price, quantity: pick.quantity };
      })
      .filter(Boolean) as OrderItem["additions"];
  }

  const batchCards = useMemo(() => {
    return batchPicks
      .map((pick) => {
        const p = productos.find((x) => x.id === pick.id);
        if (!p) return null;
        const adds = resolveAdditions(batchAdditionsById[pick.id]);
        const lineTotal = calcItemLineTotal(
          p.price,
          adds,
          pick.quantity,
          llevarExtraPorUnidad(mesaId),
        );
        return {
          id: pick.id,
          name: p.name,
          quantity: pick.quantity,
          price: p.price,
          additions: adds,
          additionPicks: batchAdditionsById[pick.id] ?? [],
          lineTotal,
        };
      })
      .filter(Boolean) as {
      id: string;
      name: string;
      quantity: number;
      price: number;
      additions: OrderItem["additions"];
      additionPicks: { id: string; quantity: number }[];
      lineTotal: number;
    }[];
    // resolveAdditions depends on adiciones; include it via adiciones in deps
  }, [batchPicks, productos, batchAdditionsById, adiciones, mesaId]);

  const batchUnits = batchPicks.reduce((s, p) => s + p.quantity, 0);
  const batchPreviewTotal = batchCards.reduce((s, c) => s + c.lineTotal, 0);

  const llevarExtra = llevarExtraPorUnidad(mesaId);
  const paraLlevar = isParaLlevar(mesaId);
  const cartTotal = cart.reduce((s, i) => s + i.total, 0);
  const mesaSeleccionada =
    mesas.find((m) => m.id === mesaId) ??
    (mesaId === MESA_LLEVAR_ID
      ? { id: MESA_LLEVAR_ID, nombre: "Para llevar", capacidad: 0, estado: "libre" as const }
      : undefined);

  function applyParaLlevarToCart(items: OrderItem[], extra: number): OrderItem[] {
    return items.map((it) => ({
      ...it,
      llevarExtra: extra > 0 ? extra : undefined,
      total: calcItemLineTotal(
        it.basePrice,
        it.additions,
        orderItemQuantity(it),
        extra,
      ),
    }));
  }

  function setParaLlevar(enabled: boolean) {
    if (enabled) {
      if (!isParaLlevar(mesaId)) {
        mesaAntesDeLlevarRef.current = mesaId;
      }
      setMesaId(MESA_LLEVAR_ID);
      setCart((c) => applyParaLlevarToCart(c, LLEVAR_EXTRA));
      setCliente((c) => c.trim() || "Para llevar");
      return;
    }
    const restore = mesaAntesDeLlevarRef.current || "barra";
    mesaAntesDeLlevarRef.current = "";
    setMesaId(restore);
    setCart((c) => applyParaLlevarToCart(c, 0));
  }

  const previewComanda = useMemo(
    (): Comanda => ({
      id: "preview",
      folio: 0,
      queueOrder: 0,
      cliente: cliente.trim() || "Cliente",
      mesa: mesaSeleccionada?.nombre,
      items: cart,
      total: cartTotal,
      createdAt: Date.now(),
      status: "pendiente",
    }),
    [cliente, mesaSeleccionada?.nombre, cart, cartTotal],
  );
  const comandasListas = useMemo(() => getComandasListas(comandas), [comandas]);
  const mesaDetalle = mesas.find((m) => m.id === mesaDetalleId);

  function continueToCliente(id: string) {
    clearMeseroFreshStart();
    setMesaId(id);
    setMesaDetalleId(null);
    if (id === MESA_LLEVAR_ID) setCliente((c) => c || "Para llevar");
    else if (!isMesaVirtual(id)) {
      const mesa = mesas.find((m) => m.id === id);
      if (mesa?.cliente) setCliente(mesa.cliente);
    }
    setCurrentStep("cliente");
  }

  function selectMesa(id: string) {
    // Para llevar: siempre pedido nuevo (mostrador sin asiento).
    if (id === MESA_LLEVAR_ID) {
      continueToCliente(id);
      return;
    }
    // Barra: si hay pedidos activos, mostrar clientes para atender; si no, pedido nuevo.
    if (id === "barra") {
      const activity = getMesaActivity(id, comandas);
      setMesaId(id);
      if (activity.activas.length > 0) {
        setMesaDetalleId(id);
        return;
      }
      continueToCliente(id);
      return;
    }
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
    setNotes("");
    setItemQuantity(1);
  }

  function clearBatch() {
    setBatchPicks([]);
    setBatchToppingsById({});
    setBatchAdditionsById({});
    setFaseQueue([]);
    setSelectedId("");
    setToppings([]);
    setNotes("");
    setItemQuantity(1);
  }

  function toggleProductAddition(productId: string, additionId: string) {
    setBatchAdditionsById((cur) => {
      const picks = cur[productId] ?? [];
      const exists = picks.find((p) => p.id === additionId);
      const next = exists
        ? picks.filter((p) => p.id !== additionId)
        : [...picks, { id: additionId, quantity: 1 }];
      return { ...cur, [productId]: next };
    });
  }

  function setProductAdditionQty(productId: string, additionId: string, quantity: number) {
    setBatchAdditionsById((cur) => ({
      ...cur,
      [productId]: (cur[productId] ?? []).map((p) =>
        p.id === additionId ? { ...p, quantity } : p,
      ),
    }));
  }

  function buildCartItem(
    p: (typeof productos)[number],
    quantity: number,
    opts?: {
      toppings?: string[];
      additions?: OrderItem["additions"];
      notes?: string;
    },
  ): OrderItem {
    const adds = opts?.additions ?? [];
    return {
      id: crypto.randomUUID(),
      micheladaId: p.id,
      micheladaName: p.name,
      basePrice: p.price,
      quantity,
      selectedToppings: opts?.toppings ?? [],
      additions: adds,
      notes: opts?.notes?.trim() || undefined,
      llevarExtra: llevarExtra || undefined,
      total: calcItemLineTotal(p.price, adds, quantity, llevarExtra),
    };
  }

  function startFaseCustomize(
    pick: ProductPick,
    rest: ProductPick[] = [],
    topsById?: Record<string, string[]>,
  ) {
    const p = productos.find((x) => x.id === pick.id);
    if (!p) return;
    const topsMap = topsById ?? batchToppingsById;
    setSelectedId(pick.id);
    setItemQuantity(pick.quantity);
    setFaseQueue(rest);
    const prefilled = topsMap[pick.id] ?? [];
    setToppings(prefilled);
    setNotes("");
    const faseSteps = buildMeseroSteps(p.pasos, p, faseIds)
      .filter(isFasePaso)
      .filter((s) => {
        if (parseFaseIdFromPaso(s) === CERVEZA_FASE_ID) {
          return !prefilled.some((id) =>
            cervezaOpcionesForProduct(p, fases).some((o) => o.id === id),
          );
        }
        return true;
      });
    if (faseSteps.length > 0) {
      setCurrentStep(faseSteps[0]);
      return;
    }
    if (rest[0]) {
      startFaseCustomize(rest[0], rest.slice(1), topsMap);
      return;
    }
    setSelectedId("");
    setCurrentStep("adiciones");
  }

  function finishProductFasesAndContinue(currentToppings: string[]) {
    const topsMap = selectedId
      ? { ...batchToppingsById, [selectedId]: currentToppings }
      : batchToppingsById;
    if (selectedId) {
      setBatchToppingsById(topsMap);
    }
    const next = faseQueue[0];
    if (next) {
      startFaseCustomize(next, faseQueue.slice(1), topsMap);
      return;
    }
    setSelectedId("");
    setToppings([]);
    setCurrentStep("adiciones");
  }

  function toggleProductPick(product: (typeof productos)[number]) {
    setProductPicks((cur) => {
      const exists = cur.find((p) => p.id === product.id);
      if (exists) {
        setDraftCervezaById((d) => {
          const next = { ...d };
          delete next[product.id];
          return next;
        });
        return cur.filter((p) => p.id !== product.id);
      }
      return [...cur, { id: product.id, quantity: 1 }];
    });
  }

  function setProductPickQty(productId: string, quantity: number) {
    setProductPicks((cur) =>
      cur.map((p) => (p.id === productId ? { ...p, quantity } : p)),
    );
  }

  function confirmProductPicks() {
    const picks = productPicks.filter((p) => p.quantity > 0);
    if (picks.length === 0) return;

    const initialTops: Record<string, string[]> = {};
    for (const pick of picks) {
      const cerv = draftCervezaById[pick.id];
      if (cerv) initialTops[pick.id] = [cerv];
    }

    setProductPicks([]);
    setDraftCervezaById({});
    setBatchPicks(picks);
    setBatchToppingsById(initialTops);
    setBatchAdditionsById({});
    setNotes("");
    setFaseQueue([]);

    const needingFases = picks.filter((pick) => {
      const p = productos.find((x) => x.id === pick.id);
      if (!p) return false;
      const prefilled = initialTops[pick.id] ?? [];
      const pending = buildMeseroSteps(p.pasos, p, faseIds)
        .filter(isFasePaso)
        .filter((s) => {
          if (parseFaseIdFromPaso(s) === CERVEZA_FASE_ID) {
            return !prefilled.some((id) =>
              cervezaOpcionesForProduct(p, fases).some((o) => o.id === id),
            );
          }
          return true;
        });
      return pending.length > 0;
    });

    if (needingFases.length > 0) {
      startFaseCustomize(needingFases[0], needingFases.slice(1), initialTops);
      return;
    }

    setSelectedId("");
    setCurrentStep("adiciones");
  }

  function toggleCategoria(id: string) {
    setSelectedCategoriaIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
    setProductPicks([]);
    setSelectedId("");
  }

  function confirmCategorias() {
    if (selectedCategoriaIds.length === 0) return;
    setProductPicks([]);
    setSelectedId("");
    setCurrentStep("producto");
  }

  function startNewItem() {
    resetItemBuilder();
    clearBatch();
    setSelectedCategoriaIds([]);
    setProductPicks([]);
    setCurrentStep("categoria");
  }

  function addBatchToCart() {
    if (batchPicks.length === 0) return;
    const notesTrim = notes.trim();
    const items: OrderItem[] = [];
    for (const pick of batchPicks) {
      const p = productos.find((x) => x.id === pick.id);
      if (!p) continue;
      items.push(
        buildCartItem(p, pick.quantity, {
          toppings: batchToppingsById[pick.id] ?? [],
          additions: resolveAdditions(batchAdditionsById[pick.id]),
          notes: notesTrim || undefined,
        }),
      );
    }
    if (items.length === 0) return;
    setCart((c) => [...c, ...items]);
    const units = items.reduce((s, i) => s + (i.quantity ?? 1), 0);
    toast.success(units === 1 ? "1 producto agregado" : `${units} productos agregados`);
    clearBatch();
    setCurrentStep("carrito");
  }

  function handleContinue() {
    if (isFasePaso(step) && inBatch) {
      const idx = steps.indexOf(currentStep);
      const next = idx >= 0 ? steps[idx + 1] : undefined;
      if (next && isFasePaso(next)) {
        goNext();
        return;
      }
      finishProductFasesAndContinue(toppings);
      return;
    }
    if (step === "notas" && inBatch) {
      addBatchToCart();
      return;
    }
    goNext();
  }

  function handleBack() {
    if (step === "adiciones" && inBatch) {
      setProductPicks(batchPicks);
      clearBatch();
      setCurrentStep("producto");
      return;
    }
    if (isFasePaso(step) && inBatch) {
      setProductPicks(batchPicks);
      clearBatch();
      setCurrentStep("producto");
      return;
    }
    goBack();
  }

  function openSendConfirm() {
    if (cart.length === 0 || sending) {
      if (cart.length === 0) toast.error("Agrega al menos una michelada");
      return;
    }
    const snapshot = {
      cliente: cliente.trim() || "Cliente",
      mesaId: mesaId || undefined,
      mesa: mesaSeleccionada?.nombre,
      items: cart,
      total: cartTotal,
      clientId: crypto.randomUUID(),
    };
    void (async () => {
      setSending(true);
      const result = await sendToBarraAndOpenTicket(snapshot, productos, {
        addComanda,
        decrementBatch,
        reloadInventario,
        adiciones,
        faseOpciones,
        beforeOpenTicket: () => {
          resetCompletedOrder();
        },
      });
      if (!result.ok) {
        setSending(false);
        toast.error(result.error);
        return;
      }
      toast.success(
        result.queued
          ? `Turno ${result.comanda.queueOrder} · Comanda #${result.comanda.folio} guardada.`
          : `Turno ${result.comanda.queueOrder} · Comanda #${result.comanda.folio} enviada a barra.`,
      );
      void reloadMesas();
      void reloadComandas();
    })();
  }

  function canContinue(): boolean {
    switch (step) {
      case "mesa":
        return mesaId.length > 0;
      case "cliente":
        return cliente.trim().length > 0;
      case "categoria":
        return selectedCategoriaIds.length > 0;
      case "producto": {
        if (!productPicks.some((p) => p.quantity > 0)) return false;
        return productPicks.every((pick) => {
          const p = productos.find((x) => x.id === pick.id);
          if (!p || !isCervezaProduct(p)) return true;
          return Boolean(draftCervezaById[pick.id]);
        });
      }
      case "adiciones":
        return inBatch ? batchPicks.length > 0 : !!michelada;
      case "notas":
        return true;
      case "item":
        return !!michelada;
      case "carrito":
        return cart.length > 0;
      default:
        if (!isFasePaso(step)) return false;
        if (parseFaseIdFromPaso(step) === CERVEZA_FASE_ID) {
          const ops = cervezaOpcionesForProduct(michelada, fases);
          return toppings.some((id) => ops.some((o) => o.id === id));
        }
        return true;
    }
  }

  if (menuLoading || mesasLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
        <p className="text-sm text-white/90 font-medium">Cargando menú…</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="rounded-2xl bg-white/90 p-8 text-center text-slate-600 font-medium shadow-lg">
        No hay productos en el menú. Pide al administrador que configure el menú.
      </div>
    );
  }

  const showNavFooter = step !== "carrito";
  const showCartFooter = step === "carrito";

  return (
    <div className="w-full flex flex-col">
      <div className="sticky z-20 top-0 -mx-3 px-3 pt-1 pb-3 sm:mx-0 sm:px-0">
        <div className="rounded-2xl bg-black/15 backdrop-blur-sm p-3 border border-white/20">
          <div className="flex items-center justify-between gap-2 text-sm mb-2">
            <span className="font-bold text-white/90 tabular-nums">
              Paso {stepIndex + 1}/{steps.length}
            </span>
            <span className="font-extrabold text-white truncate max-w-[55%] text-right">
              {getMeseroStepLabel(step, fases)}
            </span>
          </div>
          <Progress value={progress} className="h-2.5 rounded-full bg-white/25 [&>div]:bg-[#ffcc00]" />
        </div>
        {comandasListas.length > 0 && step !== "carrito" && (
          <MeseroListasBanner
            listas={comandasListas}
            onMarcarEntregada={(id) => updateStatus(id, "entregada")}
            className="mt-3"
          />
        )}
      </div>

      <div
        className={cn(
          "space-y-3 sm:space-y-4 pt-3",
          (showNavFooter || showCartFooter) && "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]",
          showCartFooter && cart.length > 0 && "pb-[calc(12rem+env(safe-area-inset-bottom,0px))]",
        )}
      >
      {step === "mesa" && (
        <MeseroPasoMesa
          mesas={mesas}
          comandas={comandas}
          meseroId={meseroId}
          mesaId={mesaId}
          mesaDetalleId={mesaDetalleId}
          mesaDetalle={mesaDetalle}
          onSelectMesa={selectMesa}
          onCerrarDetalle={() => {
            setMesaDetalleId(null);
            setMesaId("");
          }}
          onNuevoPedido={continueToCliente}
          onMarcarComandaEntregada={(id) => updateStatus(id, "entregada")}
          onMarcarMesaAtendida={marcarAtendida}
          onReloadComandas={reloadComandas}
        />
      )}

      {step === "cliente" && (
        <MeseroPasoCliente
          mesa={mesaSeleccionada}
          cliente={cliente}
          onClienteChange={setCliente}
          onCambiarMesa={() => setCurrentStep("mesa")}
        />
      )}

      {step === "categoria" && (
        <MeseroPasoCategoria
          categorias={categoriasActivas}
          selectedCategoriaIds={selectedCategoriaIds}
          onToggleCategoria={toggleCategoria}
          mesa={mesaSeleccionada}
          cliente={cliente}
        />
      )}

      {step === "producto" && (
        <MeseroPasoProducto
          categorias={categoriasSeleccionadas}
          picks={productPicks}
          cervezaById={draftCervezaById}
          onToggleProduct={toggleProductPick}
          onQuantityChange={setProductPickQty}
          onSelectCerveza={(productId, opcionId) =>
            setDraftCervezaById((cur) => ({ ...cur, [productId]: opcionId }))
          }
          getCervezaOpciones={(p) => cervezaOpcionesForProduct(p, fases)}
          onCambiarCategoria={() => {
            setSelectedId("");
            setProductPicks([]);
            setDraftCervezaById({});
            setCurrentStep("categoria");
          }}
          onIrCategorias={() => setCurrentStep("categoria")}
        />
      )}

      {isFasePaso(step) && michelada && (() => {
        const faseId = parseFaseIdFromPaso(step)!;
        const faseName =
          faseId === CERVEZA_FASE_ID
            ? "Tipo de cerveza"
            : (fases.find((f) => f.id === faseId)?.name ?? faseId);
        const opciones =
          faseId === CERVEZA_FASE_ID
            ? cervezaOpcionesForProduct(michelada, fases)
            : opcionesForFase(michelada, faseId);
        const isCerveza = faseId === CERVEZA_FASE_ID;
        return (
          <MeseroPasoFase
            faseName={faseName}
            productoName={michelada.name}
            opciones={opciones}
            selectedIds={toppings}
            singleSelect={isCerveza}
            required={isCerveza}
            onToggle={(id) =>
              setToppings((cur) => {
                if (!isCerveza) {
                  return cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
                }
                const cervezaIds = new Set(opciones.map((o) => o.id));
                const kept = cur.filter((x) => !cervezaIds.has(x));
                if (cur.includes(id)) return kept;
                return [...kept, id];
              })
            }
          />
        );
      })()}

      {step === "adiciones" && (
        <div className="space-y-4">
          <MeseroStepHeader
            title="Adiciones"
            description="Marca las adiciones de cada producto. Solo se cargan al producto de esa tarjeta."
          />

          {batchCards.map((card) => (
            <ThemedPanel key={card.id} themeId="adiciones">
              <ThemedPanelHeader
                themeId="adiciones"
                title={card.quantity > 1 ? `${card.quantity}× ${card.name}` : card.name}
                subtitle={`Base ${formatMenuPrice(card.price * card.quantity)} · Total ${formatMenuPrice(card.lineTotal)}`}
              />
              <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-2">
                {adiciones.map((a) => {
                  const pick = card.additionPicks.find((p) => p.id === a.id);
                  const qty = pick?.quantity ?? 0;
                  const selected = qty > 0;
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        "rounded-xl px-3 py-3 transition-colors",
                        selected
                          ? "bg-slate-900/5 ring-2 ring-slate-900/15"
                          : "hover:bg-slate-50",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleProductAddition(card.id, a.id)}
                        className={cn(
                          TOUCH_BTN,
                          "w-full flex items-end gap-2 text-[15px] leading-snug text-left",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 mb-0.5",
                            selected
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-300 bg-white",
                          )}
                          aria-hidden
                        >
                          {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                        </span>
                        <span className="font-semibold text-slate-800 flex-1 min-w-0">
                          {a.name}
                        </span>
                        <span
                          className="flex-1 border-b-2 border-dotted border-slate-400/70 mb-1 min-w-[1rem] max-w-[3rem]"
                          aria-hidden
                        />
                        <span className="font-extrabold text-slate-900 tabular-nums shrink-0">
                          {formatMenuPrice(a.price)}
                        </span>
                      </button>
                      {selected && (
                        <div className="mt-3 pl-8" onClick={(e) => e.stopPropagation()}>
                          <QuantityStepper
                            size="sm"
                            value={qty}
                            min={1}
                            onChange={(quantity) =>
                              setProductAdditionQty(card.id, a.id, quantity)
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                {adiciones.length === 0 && (
                  <p className="text-sm text-slate-600 text-center py-4">Sin adiciones</p>
                )}
                {card.additions.length > 0 && (
                  <p className="text-xs text-slate-600 pt-2 border-t border-dashed border-slate-200">
                    {card.additions.map((a) => formatAdditionLine(a, formatMenuPrice)).join(" · ")}
                  </p>
                )}
              </div>
            </ThemedPanel>
          ))}

          {batchCards.length === 0 && (
            <p className="text-sm text-white/90 text-center py-6">No hay productos en el lote.</p>
          )}

          {batchCards.length > 0 && (
            <p className="text-xs font-semibold text-white/90 bg-black/20 rounded-xl px-3 py-2">
              {batchUnits} unidad{batchUnits === 1 ? "" : "es"} · Total estimado{" "}
              {formatMenuPrice(batchPreviewTotal)}
            </p>
          )}
        </div>
      )}

      {step === "notas" && (
        <div className="space-y-4">
          <MeseroStepHeader
            title="Notas para barra"
            description={
              inBatch
                ? batchUnits > 1
                  ? `Instrucciones especiales para los ${batchUnits} productos (opcional).`
                  : "Instrucciones especiales para este producto (opcional)."
                : michelada
                  ? `Instrucciones especiales para ${michelada.name} (opcional).`
                  : "Instrucciones especiales (opcional)."
            }
          />
          <ThemedPanel themeId="tradicional">
            <div className="px-4 py-4 sm:px-5 sm:py-5">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sin hielo, extra picante… (opcional)"
                maxLength={200}
                rows={4}
                className="min-h-[120px] text-base sm:text-sm rounded-xl border-slate-300 bg-white"
              />
            </div>
          </ThemedPanel>
        </div>
      )}

      {step === "carrito" && (
        <MeseroPasoCarrito
          cart={cart}
          cartTotal={cartTotal}
          productos={productos}
          mesa={mesaSeleccionada}
          cliente={cliente}
          paraLlevar={paraLlevar}
          onParaLlevarChange={setParaLlevar}
          onRemoveItem={(id) => setCart((c) => c.filter((x) => x.id !== id))}
          onUpdateQuantity={(id, quantity) =>
            setCart((c) =>
              c.map((it) =>
                it.id === id
                  ? {
                      ...it,
                      quantity,
                      total: calcItemLineTotal(
                        it.basePrice,
                        it.additions,
                        quantity,
                        it.llevarExtra ?? llevarExtra,
                      ),
                    }
                  : it,
              ),
            )
          }
        />
      )}
      </div>

      {showNavFooter && (
        <MichelandiaFooterBar>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "flex-1 gap-1.5 h-12 text-base font-bold border-slate-800/20 bg-white/80",
                  TOUCH_BTN,
                )}
                onClick={handleBack}
              >
                <ArrowLeft className="h-5 w-5" />
                Atrás
              </Button>
            )}
            {step !== "mesa" &&
              step !== "categoria" &&
              step !== "producto" && (
              <Button
                type="button"
                className={cn(
                  "flex-1 gap-1.5 h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white",
                  TOUCH_BTN,
                  stepIndex === 0 && "flex-1",
                )}
                onClick={handleContinue}
                disabled={!canContinue()}
              >
                {step === "notas" && inBatch
                  ? batchUnits > 1
                    ? `Agregar ${batchUnits} al pedido`
                    : "Agregar al pedido"
                  : isFasePaso(step)
                    ? "Continuar"
                    : "Siguiente"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
            {step === "categoria" && (
              <Button
                type="button"
                className={cn(
                  "flex-1 gap-1.5 h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white",
                  TOUCH_BTN,
                )}
                onClick={confirmCategorias}
                disabled={!canContinue()}
              >
                {selectedCategoriaIds.length > 0
                  ? `Continuar (${selectedCategoriaIds.length})`
                  : "Continuar"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
            {step === "producto" && (
              <Button
                type="button"
                className={cn(
                  "flex-1 gap-1.5 h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white",
                  TOUCH_BTN,
                )}
                onClick={confirmProductPicks}
                disabled={!canContinue()}
              >
                {(() => {
                  const n = productPicks.reduce((s, p) => s + p.quantity, 0);
                  return n > 0 ? `Continuar (${n})` : "Continuar";
                })()}
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </MichelandiaFooterBar>
      )}

      {showCartFooter && (
        <MichelandiaFooterBar>
          <div className="space-y-2">
            <Button
              variant="outline"
              className={cn("w-full gap-2 h-11 rounded-xl font-bold border-slate-800/20 bg-white/80", TOUCH_BTN)}
              onClick={startNewItem}
            >
              <Plus className="h-4 w-4" />
              Agregar otra bebida
            </Button>
            {cart.length > 0 && (
              <ComandaViewDialog
                comanda={previewComanda}
                size="default"
                variant="outline"
                className={cn("w-full h-11 rounded-xl font-bold border-slate-800/20 bg-white/80", TOUCH_BTN)}
                label="Vista previa"
              />
            )}
            <Button
              size="lg"
              className={cn(
                "w-full gap-2 h-14 rounded-xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-white",
                TOUCH_BTN,
              )}
              onClick={openSendConfirm}
              disabled={cart.length === 0 || sending}
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ClipboardList className="h-5 w-5" />
              )}
              {sending ? "Enviando…" : "Enviar a barra"}
            </Button>
          </div>
        </MichelandiaFooterBar>
      )}

    </div>
  );
}
