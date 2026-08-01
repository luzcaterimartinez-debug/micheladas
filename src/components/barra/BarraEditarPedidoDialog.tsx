import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { QuantityStepper } from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orderItemLabel } from "@/lib/comanda-display";
import { formatMenuPrice } from "@/lib/michelandia-theme";
import { useMenu } from "@/lib/menu-context";
import {
  calcItemLineTotal,
  orderItemQuantity,
  type Comanda,
  type OrderItem,
} from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

type Props = {
  comanda: Comanda;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: { cliente: string; items: OrderItem[]; total: number }) => Promise<void>;
};

function recalcItem(item: OrderItem, quantity: number, notes?: string): OrderItem {
  const qty = Math.max(1, quantity);
  return {
    ...item,
    quantity: qty,
    notes: notes?.trim() || undefined,
    total: calcItemLineTotal(item.basePrice, item.additions, qty, item.llevarExtra ?? 0),
  };
}

export function BarraEditarPedidoDialog({ comanda, open, onOpenChange, onSave }: Props) {
  const { productos } = useMenu();
  const [cliente, setCliente] = useState(comanda.cliente);
  const [items, setItems] = useState<OrderItem[]>(comanda.items);
  const [addProductId, setAddProductId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCliente(comanda.cliente);
    setItems(comanda.items.map((it) => ({ ...it })));
    setAddProductId("");
    setSaving(false);
  }, [open, comanda]);

  const total = useMemo(() => items.reduce((s, it) => s + it.total, 0), [items]);

  function updateQty(id: string, quantity: number) {
    setItems((cur) =>
      cur.map((it) => (it.id === id ? recalcItem(it, quantity, it.notes) : it)),
    );
  }

  function updateNotes(id: string, notes: string) {
    setItems((cur) =>
      cur.map((it) =>
        it.id === id ? recalcItem(it, orderItemQuantity(it), notes) : it,
      ),
    );
  }

  function removeItem(id: string) {
    setItems((cur) => {
      if (cur.length <= 1) {
        toast.error("El pedido debe tener al menos un producto");
        return cur;
      }
      return cur.filter((it) => it.id !== id);
    });
  }

  function addProduct() {
    const p = productos.find((x) => x.id === addProductId);
    if (!p) {
      toast.error("Elige un producto");
      return;
    }
    const item: OrderItem = {
      id: crypto.randomUUID(),
      micheladaId: p.id,
      micheladaName: p.name,
      basePrice: p.price,
      quantity: 1,
      selectedToppings: [],
      additions: [],
      total: calcItemLineTotal(p.price, [], 1, 0),
    };
    setItems((cur) => [...cur, item]);
    setAddProductId("");
  }

  async function handleSave() {
    const name = cliente.trim();
    if (!name) {
      toast.error("Escribe el nombre del cliente");
      return;
    }
    if (items.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    setSaving(true);
    try {
      await onSave({ cliente: name, items, total });
      toast.success("Pedido actualizado");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Editar pedido #{comanda.folio}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-cliente">Cliente</Label>
            <Input
              id="edit-cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              maxLength={100}
              className="min-h-11"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Productos</p>
            {items.map((it) => (
              <div key={it.id} className="rounded-xl border p-3 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-snug">{orderItemLabel(it)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      {formatMenuPrice(it.total)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(it.id)}
                    aria-label="Quitar producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <QuantityStepper
                  size="sm"
                  value={orderItemQuantity(it)}
                  onChange={(q) => updateQty(it.id, q)}
                />
                <Textarea
                  value={it.notes ?? ""}
                  onChange={(e) => updateNotes(it.id, e.target.value)}
                  placeholder="Notas para barra (opcional)"
                  maxLength={200}
                  rows={2}
                  className="text-sm min-h-[4rem]"
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed p-3 space-y-2">
            <Label htmlFor="add-producto">Agregar producto</Label>
            <div className="flex gap-2">
              <select
                id="add-producto"
                value={addProductId}
                onChange={(e) => setAddProductId(e.target.value)}
                className={cn(
                  "flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
              >
                <option value="">Elegir…</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {formatMenuPrice(p.price)}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 shrink-0 gap-1.5"
                onClick={addProduct}
                disabled={!addProductId}
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
            <span className="text-sm font-semibold text-muted-foreground">Total</span>
            <span className="text-xl font-black tabular-nums">{formatMenuPrice(total)}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="min-h-11 gap-2"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
            {saving ? "Guardando…" : "Actualizar pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
