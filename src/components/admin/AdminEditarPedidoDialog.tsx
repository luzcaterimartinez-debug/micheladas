import { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAppMoney } from "@/lib/local-date";
import {
  calcItemLineTotal,
  isParaLlevar,
  LLEVAR_EXTRA,
  MESA_LLEVAR_ID,
  orderItemQuantity,
  useComandas,
  useMesas,
  type Comanda,
  type OrderItem,
} from "@/lib/micheladas-store";

type Props = {
  comanda: Comanda;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: Comanda) => void;
};

function withLlevar(items: OrderItem[], mesaId: string | undefined): OrderItem[] {
  const extra = isParaLlevar(mesaId) ? LLEVAR_EXTRA : 0;
  return items.map((it) => ({
    ...it,
    llevarExtra: extra > 0 ? extra : undefined,
    total: calcItemLineTotal(it.basePrice, it.additions, orderItemQuantity(it), extra),
  }));
}

export function AdminEditarPedidoDialog({ comanda, open, onOpenChange, onSaved }: Props) {
  const { updatePedido } = useComandas();
  const { mesas } = useMesas();
  const [cliente, setCliente] = useState(comanda.cliente);
  const [mesaId, setMesaId] = useState(comanda.mesaId ?? "");
  const [items, setItems] = useState<OrderItem[]>(() =>
    withLlevar(comanda.items, comanda.mesaId),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCliente(comanda.cliente);
    setMesaId(comanda.mesaId ?? "");
    setItems(withLlevar(comanda.items, comanda.mesaId));
  }, [open, comanda]);

  const total = items.reduce((s, it) => s + it.total, 0);

  function changeMesa(nextId: string) {
    setMesaId(nextId);
    setItems((prev) => withLlevar(prev, nextId || undefined));
  }

  function setQty(id: string, quantity: number) {
    if (quantity < 1) return;
    setItems((prev) =>
      withLlevar(
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                quantity,
                total: calcItemLineTotal(
                  it.basePrice,
                  it.additions,
                  quantity,
                  it.llevarExtra ?? 0,
                ),
              }
            : it,
        ),
        mesaId || undefined,
      ),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => withLlevar(prev.filter((it) => it.id !== id), mesaId || undefined));
  }

  async function save() {
    if (items.length === 0) {
      toast.error("El pedido debe tener al menos un ítem");
      return;
    }
    setSaving(true);
    try {
      const priced = withLlevar(items, mesaId || undefined);
      const totalNext = priced.reduce((s, it) => s + it.total, 0);
      const mesaNombre =
        !mesaId
          ? null
          : mesaId === MESA_LLEVAR_ID
            ? "Para llevar"
            : mesas.find((m) => m.id === mesaId)?.nombre ?? comanda.mesa ?? null;
      const updated = await updatePedido(comanda.id, {
        cliente: cliente.trim() || comanda.cliente,
        items: priced,
        total: totalNext,
        mesaId: mesaId || null,
        mesa: mesaNombre,
      });
      toast.success("Pedido actualizado");
      onSaved(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo editar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar pedido #{comanda.folio}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Input value={cliente} onChange={(e) => setCliente(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Mesa / destino</Label>
            <Select value={mesaId || "__none__"} onValueChange={(v) => changeMesa(v === "__none__" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sin mesa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin mesa</SelectItem>
                <SelectItem value={MESA_LLEVAR_ID}>Para llevar (+{formatAppMoney(LLEVAR_EXTRA)} c/u)</SelectItem>
                <SelectItem value="barra">Barra</SelectItem>
                {mesas
                  .filter((m) => m.id !== MESA_LLEVAR_ID && m.id !== "barra")
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ítems</Label>
            <ul className="divide-y rounded-lg border">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{it.micheladaName}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatAppMoney(it.total)}
                      {(it.llevarExtra ?? 0) > 0 ? " incl. para llevar" : ""}
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    className="w-16 h-9"
                    value={orderItemQuantity(it)}
                    onChange={(e) => setQty(it.id, Number(e.target.value) || 1)}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-destructive"
                    onClick={() => removeItem(it.id)}
                    aria-label="Quitar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-lg font-bold tabular-nums">Total {formatAppMoney(total)}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => void save()} disabled={saving || items.length === 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
