import { useMemo, useState } from "react";
import { Check, ChevronDown, Clock, MapPin, Package, Pencil } from "lucide-react";

import { BarraEditarPedidoDialog } from "@/components/barra/BarraEditarPedidoDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { queueLabel } from "@/lib/comanda-queue";
import { faseOpcionNames, orderItemLabel, orderItemSubtitle, timeAgo } from "@/lib/comanda-display";
import { useMenu } from "@/lib/menu-context";
import type { Comanda, OrderItem } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

type Props = {
  comandas: Comanda[];
  onMarkEntregada: (id: string) => void | Promise<void>;
  onMarkLista?: (id: string) => void | Promise<void>;
  onUpdatePedido: (id: string, patch: { cliente: string; items: OrderItem[]; total: number }) => Promise<void>;
};

function ClienteRow({
  comanda: c,
  busy,
  onAtender,
  onLista,
  onEdit,
}: {
  comanda: Comanda;
  busy: boolean;
  onAtender: () => void;
  onLista?: () => void;
  onEdit: () => void;
}) {
  const { productos } = useMenu();
  const [open, setOpen] = useState(false);
  const urgent = c.status === "pendiente" && Date.now() - c.createdAt > 10 * 60 * 1000;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "border-b last:border-b-0",
          urgent && "bg-destructive/5",
          c.status === "lista" && "bg-emerald-50/70",
        )}
      >
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tabular-nums text-primary leading-none">
                {queueLabel(c.queueOrder)}
              </span>
              {c.status === "pendiente" ? (
                <Badge variant="secondary" className="gap-1 text-[10px] px-1.5">
                  <Clock className="h-3 w-3" />
                  Preparar
                </Badge>
              ) : (
                <Badge className="gap-1 text-[10px] px-1.5 bg-emerald-600 hover:bg-emerald-600">
                  <Package className="h-3 w-3" />
                  Lista
                </Badge>
              )}
              <span className="text-[11px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="font-bold text-base sm:text-lg mt-1 truncate leading-tight">{c.cliente}</p>
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 mt-0.5">
              <span>#{c.folio}</span>
              {c.mesa && (
                <span className="inline-flex items-center gap-0.5 font-semibold uppercase">
                  <MapPin className="h-3 w-3" />
                  {c.mesa}
                </span>
              )}
              <span>
                {c.items.length} ítem{c.items.length === 1 ? "" : "s"}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <Button
              type="button"
              size="lg"
              variant="outline"
              className={cn(
                "min-h-12 sm:min-h-14 min-w-[6.5rem] px-3 gap-1.5",
                "text-sm font-bold touch-manipulation",
              )}
              disabled={busy}
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4 shrink-0" />
              Editar
            </Button>
            <Button
              type="button"
              size="lg"
              className={cn(
                "min-h-12 sm:min-h-14 min-w-[6.75rem] sm:min-w-[8.5rem] px-3 sm:px-4",
                "gap-1.5 text-sm sm:text-base font-black touch-manipulation",
                "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md",
              )}
              disabled={busy}
              onClick={onAtender}
            >
              <Check className="h-5 w-5 shrink-0" strokeWidth={3} />
              {busy ? "…" : "Atendido"}
            </Button>
          </div>
        </div>

        <div className="px-3 sm:px-4 pb-3 -mt-1">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground touch-manipulation py-1"
            >
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
              />
              {open ? "Ocultar pedido" : "Ver pedido"}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <ul className="space-y-2 rounded-lg border bg-background p-3">
              {c.items.map((it) => {
                const tops = faseOpcionNames(it.micheladaId, it.selectedToppings, productos);
                const subtitle = orderItemSubtitle(it);
                return (
                  <li key={it.id} className="text-sm">
                    <p className="font-semibold">{orderItemLabel(it)}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                    {tops.length > 0 && (
                      <p className="text-xs mt-0.5">Toppings: {tops.join(", ")}</p>
                    )}
                    {it.additions.length > 0 && (
                      <p className="text-xs mt-0.5">
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
                      <p className="text-xs mt-1 font-medium text-destructive">{it.notes}</p>
                    )}
                  </li>
                );
              })}
            </ul>
            {c.status === "pendiente" && onLista && (
              <Button
                type="button"
                variant="secondary"
                className="w-full mt-2 min-h-11 gap-2"
                disabled={busy}
                onClick={onLista}
              >
                <Package className="h-4 w-4" />
                Solo marcar lista (mesero)
              </Button>
            )}
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}

export function BarraClientesAtender({
  comandas,
  onMarkEntregada,
  onMarkLista,
  onUpdatePedido,
}: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Comanda | null>(null);

  const activas = useMemo(
    () =>
      comandas
        .filter((c) => c.status === "pendiente" || c.status === "lista")
        .sort((a, b) => (a.queueOrder ?? 0) - (b.queueOrder ?? 0) || a.createdAt - b.createdAt),
    [comandas],
  );

  async function atender(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      await onMarkEntregada(id);
    } finally {
      setBusyId(null);
    }
  }

  async function marcarLista(id: string) {
    if (!onMarkLista || busyId) return;
    setBusyId(id);
    try {
      await onMarkLista(id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b bg-emerald-600 px-4 py-3.5 text-white">
        <div>
          <p className="text-base font-black leading-none">Clientes que pidieron</p>
          <p className="text-xs text-white/85 mt-1.5">
            Lista activa · Editar o marcar Atendido
          </p>
        </div>
        <Badge className="bg-white text-emerald-800 hover:bg-white font-black tabular-nums text-sm px-2.5 py-1">
          {activas.length}
        </Badge>
      </div>

      {activas.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          No hay clientes en cola
        </div>
      ) : (
        <div className="max-h-[min(70vh,36rem)] overflow-y-auto">
          {activas.map((c) => (
            <ClienteRow
              key={c.id}
              comanda={c}
              busy={busyId === c.id}
              onAtender={() => void atender(c.id)}
              onLista={onMarkLista ? () => void marcarLista(c.id) : undefined}
              onEdit={() => setEditing(c)}
            />
          ))}
        </div>
      )}

      {editing && (
        <BarraEditarPedidoDialog
          comanda={editing}
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          onSave={async (patch) => {
            await onUpdatePedido(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
