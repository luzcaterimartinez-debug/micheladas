import { useEffect, useMemo, useState } from "react";
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
import { MeseroPasoItem } from "@/components/mesero/MeseroPasoItem";
import { MeseroPasoFase } from "@/components/mesero/MeseroPasoFase";
import { MeseroPasoMesa } from "@/components/mesero/MeseroPasoMesa";
import { useMeseroComandaAlerts } from "@/hooks/use-mesero-comanda-alerts";
import { faseOpcionNames } from "@/lib/comanda-display";
import { sendToBarraAndOpenTicket } from "@/lib/send-to-barra";
import { consumeMeseroCartRestore } from "@/lib/ticket-print-session";
import { isFasePaso, opcionesForFase, parseFaseIdFromPaso } from "@/lib/fases";
import { getStoredSession } from "@/lib/auth";
import { getComandasListas, getMesaActivity, isMesaVirtual } from "@/lib/pos-utils";
import { useMenu } from "@/lib/menu-context";
import {
  calcItemLineTotal,
  formatAdditionLine,
  llevarExtraPorUnidad,
  MESA_LLEVAR_ID,
  useComandas,
  useInventory,
  useMesas,
  type Comanda,
  type OrderItem,
} from "@/lib/micheladas-store";
import { buildMeseroSteps, getMeseroStepLabel, type MeseroFlowStep } from "@/lib/product-steps";
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
  const [selectedCategoriaIds, setSelectedCategoriaIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [productPicks, setProductPicks] = useState<ProductPick[]>([]);
  /** Cola de productos con fases pendientes de personalizar. */
  const [customizeQueue, setCustomizeQueue] = useState<ProductPick[]>([]);
  const [toppings, setToppings] = useState<string[]>([]);
  const [additionPicks, setAdditionPicks] = useState<{ id: string; quantity: number }[]>([]);
  const [notes, setNotes] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const restored = consumeMeseroCartRestore();
    if (!restored) return;
    setCart(restored.cart);
    setCliente(restored.cliente);
    setMesaId(restored.mesaId);
    if (restored.cart.length > 0) setCurrentStep("carrito");
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
  const steps = useMemo(
    () => buildMeseroSteps(michelada?.pasos, michelada, faseIds),
    [michelada, faseIds],
  );
  const stepIndex = Math.max(0, steps.indexOf(currentStep));
  const step = steps[stepIndex] ?? currentStep;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const selectedAdditions = useMemo(
    () =>
      additionPicks
        .map((pick) => {
          const a = adiciones.find((x) => x.id === pick.id);
          if (!a) return null;
          return { id: a.id, name: a.name, price: a.price, quantity: pick.quantity };
        })
        .filter(Boolean) as OrderItem["additions"],
    [adiciones, additionPicks],
  );

  const llevarExtra = llevarExtraPorUnidad(mesaId);
  const itemTotal = michelada
    ? calcItemLineTotal(michelada.price, selectedAdditions, itemQuantity, llevarExtra)
    : 0;
  const cartTotal = cart.reduce((s, i) => s + i.total, 0);
  const mesaSeleccionada =
    mesas.find((m) => m.id === mesaId) ??
    (mesaId === MESA_LLEVAR_ID
      ? { id: MESA_LLEVAR_ID, nombre: "Para llevar", capacidad: 0, estado: "libre" as const }
      : undefined);
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
    // Para llevar / barra: siempre pedido nuevo (no atrapar en actividad).
    if (isMesaVirtual(id)) {
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
    setAdditionPicks([]);
    setNotes("");
    setItemQuantity(1);
  }

  function toggleAdditionPick(id: string) {
    setAdditionPicks((cur) => {
      const exists = cur.find((p) => p.id === id);
      if (exists) return cur.filter((p) => p.id !== id);
      return [...cur, { id, quantity: 1 }];
    });
  }

  function setAdditionPickQty(id: string, quantity: number) {
    setAdditionPicks((cur) =>
      cur.map((p) => (p.id === id ? { ...p, quantity } : p)),
    );
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

  function startCustomize(pick: ProductPick, rest: ProductPick[] = []) {
    const p = productos.find((x) => x.id === pick.id);
    if (!p) return;
    setSelectedId(pick.id);
    setItemQuantity(pick.quantity);
    setCustomizeQueue(rest);
    resetItemBuilder();
    setItemQuantity(pick.quantity);
    const next = buildMeseroSteps(p.pasos, p, faseIds);
    const idx = next.indexOf("producto");
    if (idx >= 0 && idx < next.length - 1) setCurrentStep(next[idx + 1]);
    else setCurrentStep("item");
  }

  function finishCustomizeAndContinue() {
    const next = customizeQueue[0];
    if (next) {
      startCustomize(next, customizeQueue.slice(1));
      return;
    }
    setSelectedId("");
    setCustomizeQueue([]);
    resetItemBuilder();
    setCurrentStep("carrito");
  }

  function toggleProductPick(product: (typeof productos)[number]) {
    setProductPicks((cur) => {
      const exists = cur.find((p) => p.id === product.id);
      if (exists) return cur.filter((p) => p.id !== product.id);
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

    setProductPicks([]);
    // Cada producto se personaliza por separado (fases + adiciones + notas).
    const [first, ...rest] = picks;
    startCustomize(first, rest);
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
    setSelectedId("");
    setProductPicks([]);
    setCustomizeQueue([]);
    setSelectedCategoriaIds([]);
    setCurrentStep("categoria");
  }

  function addToCart() {
    if (!michelada) return;
    const item = buildCartItem(michelada, itemQuantity, {
      toppings,
      additions: selectedAdditions,
      notes,
    });
    setCart((c) => [...c, item]);
    toast.success(
      itemQuantity > 1
        ? `${itemQuantity}× ${michelada.name} agregadas`
        : `${michelada.name} agregada`,
    );
    finishCustomizeAndContinue();
  }

  function openSendConfirm() {
    if (cart.length === 0 || sending) {
      if (cart.length === 0) toast.error("Agrega al menos una michelada");
      return;
    }
    void (async () => {
      setSending(true);
      const clientId = crypto.randomUUID();
      const result = await sendToBarraAndOpenTicket(
        {
          cliente: cliente.trim() || "Cliente",
          mesaId: mesaId || undefined,
          mesa: mesaSeleccionada?.nombre,
          items: cart,
          total: cartTotal,
          clientId,
        },
        productos,
        {
          addComanda,
          decrementBatch,
          reloadInventario,
          adiciones,
          faseOpciones,
        },
      );
      setSending(false);
      if (!result.ok) {
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
      case "producto":
        return productPicks.some((p) => p.quantity > 0);
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
          onToggleProduct={toggleProductPick}
          onQuantityChange={setProductPickQty}
          onCambiarCategoria={() => {
            setSelectedId("");
            setProductPicks([]);
            setCurrentStep("categoria");
          }}
          onIrCategorias={() => setCurrentStep("categoria")}
        />
      )}

      {isFasePaso(step) && michelada && (() => {
        const faseId = parseFaseIdFromPaso(step)!;
        const faseName = fases.find((f) => f.id === faseId)?.name ?? faseId;
        return (
          <MeseroPasoFase
            faseName={faseName}
            productoName={michelada.name}
            opciones={opcionesForFase(michelada, faseId)}
            selectedIds={toppings}
            onToggle={(id) =>
              setToppings((cur) =>
                cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
              )
            }
          />
        );
      })()}

      {step === "adiciones" && (
        <div className="space-y-4">
          <MeseroStepHeader
            title="Adiciones"
            description={
              michelada
                ? `Extras opcionales para ${michelada.name}${
                    customizeQueue.length > 0
                      ? ` · quedan ${customizeQueue.length} más`
                      : ""
                  }.`
                : "Extras opcionales para la michelada."
            }
          />
          <ThemedPanel themeId="adiciones">
            <ThemedPanelHeader
              themeId="adiciones"
              title="Adiciones"
              subtitle={michelada ? michelada.name : "Extras para tu michelada"}
            />
            <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-2">
              {adiciones.map((a) => {
                const pick = additionPicks.find((p) => p.id === a.id);
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
                      onClick={() => toggleAdditionPick(a.id)}
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
                          onChange={(quantity) => setAdditionPickQty(a.id, quantity)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {adiciones.length === 0 && (
                <p className="text-sm text-slate-600 text-center py-6">Sin adiciones</p>
              )}
            </div>
          </ThemedPanel>
        </div>
      )}

      {step === "notas" && (
        <div className="space-y-4">
          <MeseroStepHeader
            title="Notas para barra"
            description={
              michelada
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

      {step === "item" && michelada && (
        <MeseroPasoItem
          michelada={michelada}
          toppingLabels={faseOpcionNames(michelada.id, toppings, productos)}
          additions={selectedAdditions}
          notes={notes}
          itemTotal={itemTotal}
          quantity={itemQuantity}
          onQuantityChange={setItemQuantity}
          mesa={mesaSeleccionada}
          cliente={cliente}
          llevarExtra={llevarExtra}
          onAddToCart={addToCart}
        />
      )}

      {step === "carrito" && (
        <MeseroPasoCarrito
          cart={cart}
          cartTotal={cartTotal}
          productos={productos}
          mesa={mesaSeleccionada}
          cliente={cliente}
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
                onClick={goBack}
              >
                <ArrowLeft className="h-5 w-5" />
                Atrás
              </Button>
            )}
            {step !== "item" &&
              step !== "mesa" &&
              step !== "categoria" &&
              step !== "producto" && (
              <Button
                type="button"
                className={cn(
                  "flex-1 gap-1.5 h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white",
                  TOUCH_BTN,
                  stepIndex === 0 && "flex-1",
                )}
                onClick={goNext}
                disabled={!canContinue()}
              >
                {isFasePaso(step) ? "Continuar" : "Siguiente"}
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
                  return n > 0 ? `Agregar (${n})` : "Agregar";
                })()}
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
            {step === "item" && (
              <Button
                type="button"
                variant="outline"
                className={cn("flex-1 h-12 text-base font-bold border-slate-800/20 bg-white/80", TOUCH_BTN)}
                onClick={goBack}
              >
                Atrás
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
