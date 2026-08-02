import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Trash2, Plus, Beer, ShoppingCart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { faseOpcionNames, orderItemLabel } from "@/lib/comanda-display";
import { sendToBarraAndOpenTicket } from "@/lib/send-to-barra";
import {
  clearMeseroFreshStart,
  consumeMeseroCartRestore,
  shouldForceMeseroFreshStart,
} from "@/lib/ticket-print-session";
import { useMenu } from "@/lib/menu-context";
import { QuantityStepper } from "@/components/QuantityStepper";
import {
  calcItemLineTotal,
  llevarExtraPorUnidad,
  MESA_LLEVAR_ID,
  useComandas,
  useInventory,
  useMesas,
  type Comanda,
  type OrderItem,
} from "@/lib/micheladas-store";
import { formatAppMoney } from "@/lib/local-date";

export function OrderBuilder() {
  const { productos, adiciones, faseOpciones } = useMenu();
  const { addComanda, updateStatus } = useComandas();
  const { decrementBatch, reload: reloadInventario } = useInventory();
  const [selectedId, setSelectedId] = useState<string>("");
  const [toppings, setToppings] = useState<string[]>([]);
  const [additionPicks, setAdditionPicks] = useState<{ id: string; quantity: number }[]>([]);
  const [notes, setNotes] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cliente, setCliente] = useState("");
  const [mesaId, setMesaId] = useState<string>("__none__");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [sending, setSending] = useState(false);
  const sendClientIdRef = useRef<string | null>(null);

  function resetCompletedOrder() {
    setCart([]);
    setCliente("");
    setMesaId("__none__");
    setSelectedId("");
    setToppings([]);
    setAdditionPicks([]);
    setNotes("");
    setItemQuantity(1);
    setSending(false);
    sendClientIdRef.current = null;
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
    setMesaId(restored.mesaId || "__none__");
  }, []);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && shouldForceMeseroFreshStart()) {
        resetCompletedOrder();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const activeId = selectedId || productos[0]?.id || "";
  const michelada = productos.find((m) => m.id === activeId);
  const { mesas } = useMesas();

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

  const llevarExtra = llevarExtraPorUnidad(mesaId === "__none__" ? null : mesaId);
  const currentUnitTotal = michelada
    ? calcItemLineTotal(michelada.price, selectedAdditions, 1, llevarExtra)
    : 0;
  const currentTotal = michelada
    ? calcItemLineTotal(michelada.price, selectedAdditions, itemQuantity, llevarExtra)
    : 0;
  const cartTotal = cart.reduce((s, i) => s + i.total, 0);
  const mesaNombre =
    mesaId !== "__none__"
      ? mesas.find((m) => m.id === mesaId)?.nombre ??
        (mesaId === MESA_LLEVAR_ID ? "Para llevar" : undefined)
      : undefined;

  const previewComanda = useMemo(
    (): Comanda => ({
      id: "preview",
      folio: 0,
      queueOrder: 0,
      cliente: cliente.trim() || "Cliente",
      mesa: mesaNombre,
      items: cart,
      total: cartTotal,
      createdAt: Date.now(),
      status: "pendiente",
    }),
    [cliente, mesaNombre, cart, cartTotal],
  );

  function resetBuilder() {
    setToppings([]);
    setAdditionPicks([]);
    setNotes("");
    setItemQuantity(1);
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
      llevarExtra: llevarExtra || undefined,
      total: currentTotal,
    };
    setCart((c) => [...c, item]);
    resetBuilder();
    toast.success(
      itemQuantity > 1
        ? `${itemQuantity}× ${michelada.name} agregadas`
        : `${michelada.name} agregada`,
    );
  }

  function openSendConfirm() {
    if (cart.length === 0 || sending) {
      if (cart.length === 0) toast.error("Agrega al menos una michelada");
      return;
    }
    if (!sendClientIdRef.current) sendClientIdRef.current = crypto.randomUUID();
    const snapshot = {
      cliente: cliente.trim() || "Cliente",
      mesaId: mesaId !== "__none__" ? mesaId : undefined,
      mesa: mesaNombre,
      items: cart,
      total: cartTotal,
      clientId: sendClientIdRef.current,
    };
    void (async () => {
      setSending(true);
      const result = await sendToBarraAndOpenTicket(snapshot, productos, {
        addComanda,
        markEntregada: (id) => updateStatus(id, "entregada"),
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
      sendClientIdRef.current = null;
      toast.success(
        result.queued
          ? `Comanda #${result.comanda.folio} guardada para sincronizar.`
          : `Comanda #${result.comanda.folio} enviada a barra.`,
      );
    })();
  }

  if (!michelada) {
    return <p className="text-center text-muted-foreground py-12">Cargando menú…</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beer className="h-5 w-5 text-primary" /> Elige el tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {productos.map((m) => {
              const active = m.id === activeId;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedId(m.id);
                    setToppings([]);
                  }}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    active
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                    </div>
                    <Badge variant="secondary">{formatAppMoney(m.price)}</Badge>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {michelada.faseOpciones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fases — {michelada.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from(
                michelada.faseOpciones.reduce((map, op) => {
                  const list = map.get(op.faseId) ?? [];
                  list.push(op);
                  map.set(op.faseId, list);
                  return map;
                }, new Map<string, typeof michelada.faseOpciones>()),
              ).map(([faseId, opciones]) => {
                const faseName =
                  fases.find((f) => f.id === faseId)?.name ??
                  opciones[0]?.faseName ??
                  faseId;
                return (
                  <div key={faseId}>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{faseName}</p>
                    <div className="flex flex-wrap gap-2">
                      {opciones.map((t) => {
                        const checked = toppings.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() =>
                              setToppings((cur) =>
                                cur.includes(t.id)
                                  ? cur.filter((x) => x !== t.id)
                                  : [...cur, t.id],
                              )
                            }
                            className={`px-3 py-2 rounded-full border text-sm transition ${
                              checked
                                ? "bg-secondary border-secondary text-secondary-foreground"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            {checked ? "✓ " : "+ "}
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Adiciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {adiciones.map((a) => {
              const pick = additionPicks.find((p) => p.id === a.id);
              const qty = pick?.quantity ?? 0;
              const selected = qty > 0;
              return (
                <div
                  key={a.id}
                  className={`rounded-lg border px-3 py-2 ${
                    selected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() =>
                          setAdditionPicks((cur) => {
                            const exists = cur.find((p) => p.id === a.id);
                            if (exists) return cur.filter((p) => p.id !== a.id);
                            return [...cur, { id: a.id, quantity: 1 }];
                          })
                        }
                      />
                      <span className="text-sm font-medium">{a.name}</span>
                    </span>
                    <Badge variant="outline">+{formatAppMoney(a.price)}</Badge>
                  </label>
                  {selected && (
                    <div className="mt-2 pl-7">
                      <QuantityStepper
                        size="sm"
                        value={qty}
                        min={1}
                        onChange={(quantity) =>
                          setAdditionPicks((cur) =>
                            cur.map((p) => (p.id === a.id ? { ...p, quantity } : p)),
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas para barra</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sin hielo, extra picante, etc."
              maxLength={200}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border bg-card p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Cantidad</p>
            <QuantityStepper value={itemQuantity} onChange={setItemQuantity} size="sm" />
            <p className="text-xs text-muted-foreground">
              {formatAppMoney(currentUnitTotal)} c/u
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total de esta michelada</p>
            <p className="text-2xl font-bold">{formatAppMoney(currentTotal)}</p>
          </div>
          <Button size="lg" onClick={addToCart} className="sm:self-end">
            <Plus className="h-4 w-4 mr-1" /> Agregar al pedido
          </Button>
        </div>
      </div>

      <Card className="lg:sticky lg:top-4 self-start">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Pedido actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cliente">Cliente</Label>
            <Input
              id="cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nombre del cliente"
              maxLength={40}
            />
          </div>
          <div>
            <Label>Mesa</Label>
            <Select
              value={mesaId}
              onValueChange={(v) => {
                clearMeseroFreshStart();
                setMesaId(v);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin asignar</SelectItem>
                {mesas.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nombre} {m.estado !== "libre" ? `· ${m.estado}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aún no hay micheladas en el pedido
            </p>
          ) : (
            <ScrollArea className="max-h-[340px] pr-2">
              <ul className="space-y-3">
                {cart.map((it) => (
                  <li key={it.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{orderItemLabel(it)}</p>
                        {it.selectedToppings.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Fases:{" "}
                            {faseOpcionNames(it.micheladaId, it.selectedToppings, productos).join(
                              ", ",
                            )}
                          </p>
                        )}
                        {it.additions.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Adiciones:{" "}
                            {it.additions
                              .map((a) => {
                                const q = Math.max(1, a.quantity ?? 1);
                                return q > 1 ? `${q}× ${a.name}` : a.name;
                              })
                              .join(", ")}
                          </p>
                        )}
                        {it.notes && (
                          <p className="text-xs italic text-muted-foreground mt-1">"{it.notes}"</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatAppMoney(it.total)}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setCart((c) => c.filter((x) => x.id !== it.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}

          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">{formatAppMoney(cartTotal)}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={openSendConfirm}
            disabled={cart.length === 0 || sending}
          >
            {sending ? "Enviando…" : "Enviar pedido y generar comanda"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
