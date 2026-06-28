import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import {
  MenuPriceRow,
  MeseroStepHeader,
  MichelandiaFooterBar,
  ThemedPanel,
  ThemedPanelHeader,
} from "@/components/michelandia/michelandia-ui";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ComandaViewDialog } from "@/components/ComandaViewDialog";
import { MeseroListasBanner } from "@/components/mesero/MeseroListasBanner";
import { MeseroPasoCategoria } from "@/components/mesero/MeseroPasoCategoria";
import { MeseroPasoProducto } from "@/components/mesero/MeseroPasoProducto";
import { MeseroPasoCliente } from "@/components/mesero/MeseroPasoCliente";
import { MeseroPasoCarrito } from "@/components/mesero/MeseroPasoCarrito";
import { MeseroPasoItem } from "@/components/mesero/MeseroPasoItem";
import { MeseroPasoFase } from "@/components/mesero/MeseroPasoFase";
import { MeseroPasoMesa } from "@/components/mesero/MeseroPasoMesa";
import { printComandaOnSend } from "@/lib/comanda-print";
import { useMeseroComandaAlerts } from "@/hooks/use-mesero-comanda-alerts";
import { faseOpcionNames } from "@/lib/comanda-display";
import { isFasePaso, opcionesForFase, parseFaseIdFromPaso } from "@/lib/fases";
import { getStoredSession } from "@/lib/auth";
import { isAppOnline } from "@/lib/offline/network";
import { getPendingCount } from "@/lib/offline/outbox";
import { buildOrderDeductions } from "@/lib/inventory-deduction";
import { getComandasListas, getMesaActivity } from "@/lib/pos-utils";
import { useMenu } from "@/lib/menu-context";
import {
  calcItemLineTotal,
  useComandas,
  useInventory,
  useMesas,
  type Comanda,
  type OrderItem,
} from "@/lib/micheladas-store";
import { buildMeseroSteps, getMeseroStepLabel, type MeseroFlowStep } from "@/lib/product-steps";
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
  const [selectedCategoriaId, setSelectedCategoriaId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [toppings, setToppings] = useState<string[]>([]);
  const [additionIds, setAdditionIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [sending, setSending] = useState(false);

  const categoriasActivas = useMemo(
    () => categorias.filter((c) => c.activo !== false && c.productos.length > 0),
    [categorias],
  );
  const categoriaSeleccionada = categoriasActivas.find((c) => c.id === selectedCategoriaId);
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
      adiciones
        .filter((a) => additionIds.includes(a.id))
        .map(({ id, name, price }) => ({ id, name, price })),
    [adiciones, additionIds],
  );

  const itemTotal = michelada ? calcItemLineTotal(michelada.price, selectedAdditions, itemQuantity) : 0;
  const cartTotal = cart.reduce((s, i) => s + i.total, 0);
  const mesaSeleccionada = mesas.find((m) => m.id === mesaId);
  const comandasListas = useMemo(() => getComandasListas(comandas), [comandas]);
  const mesaDetalle = mesas.find((m) => m.id === mesaDetalleId);

  function continueToCliente(id: string) {
    const mesa = mesas.find((m) => m.id === id);
    setMesaId(id);
    setMesaDetalleId(null);
    if (mesa?.cliente) setCliente(mesa.cliente);
    else if (id === "llevar") setCliente((c) => c || "Para llevar");
    setCurrentStep("cliente");
  }

  function selectMesa(id: string) {
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
    setItemQuantity(1);
  }

  function selectCategoria(id: string) {
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
    const item: OrderItem = {
      id: crypto.randomUUID(),
      micheladaId: michelada.id,
      micheladaName: michelada.name,
      basePrice: michelada.price,
      quantity: itemQuantity,
      selectedToppings: [...toppings],
      additions: selectedAdditions,
      notes: notes.trim() || undefined,
      total: itemTotal,
    };
    setCart((c) => [...c, item]);
    resetItemBuilder();
    setSelectedId("");
    toast.success(
      itemQuantity > 1
        ? `${itemQuantity}× ${michelada.name} agregadas`
        : `${michelada.name} agregada`,
    );
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
        mesaId: mesaId || undefined,
        mesa,
        items: cart,
        total: cartTotal,
      });
      const queued = getPendingCount() > pendingBefore;
      if (!getStoredSession() || !isAppOnline() || queued) {
        decrementBatch(buildOrderDeductions(cart, adiciones, productos, faseOpciones));
      } else {
        void reloadInventario();
      }
      printComandaOnSend(c, productos);
      toast.success(
        queued
          ? `Turno ${c.queueOrder} · Comanda #${c.folio} guardada.`
          : `Turno ${c.queueOrder} · Comanda #${c.folio} enviada a barra.`,
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

  function canContinue(): boolean {
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
          selectedCategoriaId={selectedCategoriaId}
          onSelectCategoria={selectCategoria}
          mesa={mesaSeleccionada}
          cliente={cliente}
        />
      )}

      {step === "producto" && (
        <MeseroPasoProducto
          categoria={categoriaSeleccionada}
          selectedProductId={selectedId}
          onSelectProduct={(m) => {
            setSelectedId(m.id);
            setToppings([]);
            setAdditionIds([]);
            setNotes("");
            const next = buildMeseroSteps(m.pasos, m, faseIds);
            const idx = next.indexOf("producto");
            if (idx >= 0 && idx < next.length - 1) setCurrentStep(next[idx + 1]);
          }}
          onCambiarCategoria={() => {
            setSelectedCategoriaId("");
            setSelectedId("");
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
            description="Extras opcionales para la michelada."
          />
          <ThemedPanel themeId="adiciones">
            <ThemedPanelHeader themeId="adiciones" title="Adiciones" subtitle="Extras para tu michelada" />
            <div className="px-2 py-2 sm:px-3 sm:py-3 space-y-1">
              {adiciones.map((a) => {
                const checked = additionIds.includes(a.id);
                return (
                  <MenuPriceRow
                    key={a.id}
                    label={checked ? `✓ ${a.name}` : a.name}
                    price={a.price}
                    selected={checked}
                    onClick={() =>
                      setAdditionIds((cur) =>
                        cur.includes(a.id) ? cur.filter((x) => x !== a.id) : [...cur, a.id],
                      )
                    }
                  />
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
            description="Instrucciones especiales (opcional)."
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
                      total: calcItemLineTotal(it.basePrice, it.additions, quantity),
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
              !isFasePaso(step) && (
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
                Siguiente
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
                comanda={{
                  id: "preview",
                  folio: 0,
                  queueOrder: 0,
                  cliente: cliente.trim() || "Cliente",
                  mesa: mesaSeleccionada?.nombre,
                  items: cart,
                  total: cartTotal,
                  createdAt: Date.now(),
                  status: "pendiente",
                } satisfies Comanda}
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
              onClick={() => void sendOrder()}
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
