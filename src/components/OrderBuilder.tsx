import { useMemo, useState } from "react";
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
import { getStoredSession } from "@/lib/auth";
import { buildOrderDeductions } from "@/lib/inventory-deduction";
import { useMenu } from "@/lib/menu-context";
import { QuantityStepper } from "@/components/QuantityStepper";
import {
  calcItemLineTotal,
  useComandas,
  useInventory,
  useMesas,
  type OrderItem,
} from "@/lib/micheladas-store";

export function OrderBuilder() {
  const { productos, adiciones, faseOpciones } = useMenu();
  const [selectedId, setSelectedId] = useState<string>("");
  const [toppings, setToppings] = useState<string[]>([]);
  const [additions, setAdditions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [cliente, setCliente] = useState("");
  const [mesaId, setMesaId] = useState<string>("__none__");
  const [cart, setCart] = useState<OrderItem[]>([]);

  const activeId = selectedId || productos[0]?.id || "";
  const michelada = productos.find((m) => m.id === activeId);
  const { addComanda } = useComandas();
  const { decrementBatch, reload: reloadInventario } = useInventory();
  const { mesas } = useMesas();

  const selectedAdditions = useMemo(
    () => adiciones.filter((a) => additions.includes(a.id)).map(({ id, name, price }) => ({ id, name, price })),
    [adiciones, additions],
  );

  const currentUnitTotal = michelada ? calcItemLineTotal(michelada.price, selectedAdditions, 1) : 0;
  const currentTotal = michelada
    ? calcItemLineTotal(michelada.price, selectedAdditions, itemQuantity)
    : 0;
  const cartTotal = cart.reduce((s, i) => s + i.total, 0);

  function resetBuilder() {
    setToppings([]);
    setAdditions([]);
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

  async function sendOrder() {
    if (cart.length === 0) {
      toast.error("Agrega al menos una michelada");
      return;
    }
    const nombre = cliente.trim() || "Cliente";
    const mesa = mesaId !== "__none__" ? mesas.find((m) => m.id === mesaId)?.nombre : undefined;
    try {
      const c = await addComanda({
        cliente: nombre,
        mesaId: mesaId !== "__none__" ? mesaId : undefined,
        mesa,
        items: cart,
        total: cartTotal,
      });
      if (!getStoredSession()) {
        decrementBatch(buildOrderDeductions(cart, adiciones, productos, faseOpciones));
      } else {
        void reloadInventario();
      }
      toast.success(
        `${c.queueOrder ? `Turno ${c.queueOrder} · ` : ""}Comanda #${c.folio} enviada a barra.`,
      );
      setCart([]);
      setCliente("");
      setMesaId("__none__");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar");
    }
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
                    <Badge variant="secondary">${m.price}</Badge>
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
          <CardContent className="grid sm:grid-cols-2 gap-2">
            {adiciones.map((a) => {
              const checked = additions.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 cursor-pointer ${
                    checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() =>
                        setAdditions((cur) =>
                          cur.includes(a.id) ? cur.filter((x) => x !== a.id) : [...cur, a.id],
                        )
                      }
                    />
                    <span className="text-sm font-medium">{a.name}</span>
                  </span>
                  <Badge variant="outline">+${a.price}</Badge>
                </label>
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
              ${currentUnitTotal} c/u
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total de esta michelada</p>
            <p className="text-2xl font-bold">${currentTotal}</p>
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
            <Select value={mesaId} onValueChange={setMesaId}>
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
                            Adiciones: {it.additions.map((a) => a.name).join(", ")}
                          </p>
                        )}
                        {it.notes && (
                          <p className="text-xs italic text-muted-foreground mt-1">"{it.notes}"</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${it.total}</p>
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
            <span className="text-2xl font-bold">${cartTotal}</span>
          </div>
          <Button className="w-full" size="lg" onClick={() => void sendOrder()}>
            Enviar pedido y generar comanda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
