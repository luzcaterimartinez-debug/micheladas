import { Bell, Check, ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComandaViewDialog } from "@/components/ComandaViewDialog";
import type { Comanda } from "@/lib/micheladas-store";
import { getMesaActivity, type MesaActivity } from "@/lib/pos-utils";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<Comanda["status"], { label: string; cls: string }> = {
  pendiente: { label: "En barra", cls: "bg-amber-500/15 text-amber-800 dark:text-amber-200" },
  lista: { label: "¡Lista!", cls: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200" },
  entregada: { label: "Entregada", cls: "bg-muted text-muted-foreground" },
};

type Props = {
  mesaId: string;
  mesaNombre: string;
  comandas: Comanda[];
  onNuevoPedido: () => void;
  onCerrar: () => void;
  onMarcarEntregada: (comandaId: string) => Promise<void>;
};

export function MeseroMesaActividad({
  mesaId,
  mesaNombre,
  comandas,
  onNuevoPedido,
  onCerrar,
  onMarcarEntregada,
}: Props) {
  const activity: MesaActivity = getMesaActivity(mesaId, comandas);

  async function entregar(c: Comanda) {
    try {
      await onMarcarEntregada(c.id);
      toast.success(`Comanda #${c.folio} entregada`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  return (
    <div className="rounded-2xl border bg-muted/20 p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-lg">{mesaNombre}</p>
          <p className="text-sm text-muted-foreground">
            {activity.activas.length} pedido{activity.activas.length === 1 ? "" : "s"} activo
            {activity.activas.length === 1 ? "" : "s"}{" "}
            {activity.totalCuenta > 0 && (
              <span className="font-semibold text-foreground"> · ${activity.totalCuenta}</span>
            )}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCerrar}>
          Cambiar mesa
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {activity.pendientes > 0 && (
          <Badge variant="outline" className="gap-1">
            <ClipboardList className="h-3 w-3" />
            {activity.pendientes} en preparación
          </Badge>
        )}
        {activity.listas > 0 && (
          <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
            <Bell className="h-3 w-3" />
            {activity.listas} para servir
          </Badge>
        )}
      </div>

      <ul className="space-y-2 max-h-[40vh] overflow-y-auto">
        {activity.activas.map((c) => {
          const st = STATUS_BADGE[c.status];
          return (
            <li
              key={c.id}
              className={cn(
                "rounded-lg border bg-background px-3 py-2.5 flex flex-col gap-2",
                c.status === "lista" && "border-emerald-500/30",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm">
                    #{c.folio} <span className="text-muted-foreground font-normal">·</span>{" "}
                    {c.cliente}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {c.items.length} ítem{c.items.length === 1 ? "" : "s"} · ${c.total}
                  </p>
                </div>
                <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-md", st.cls)}>
                  {st.label}
                </span>
              </div>
              <div className="flex gap-2">
                <ComandaViewDialog comanda={c} size="sm" variant="ghost" label="Detalle" />
                {c.status === "lista" && (
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1 flex-1 min-w-[8rem]"
                    onClick={() => void entregar(c)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Marcar entregada
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <Button type="button" className="w-full gap-2 h-12" onClick={onNuevoPedido}>
        <Plus className="h-4 w-4" />
        Agregar nuevo pedido
      </Button>
    </div>
  );
}

type MesaCardActivityProps = {
  activity: MesaActivity;
};

export function MesaCardActivityBadges({ activity }: MesaCardActivityProps) {
  if (activity.activas.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] leading-tight">
      {activity.listas > 0 && (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {activity.listas} lista{activity.listas === 1 ? "" : "s"}
        </span>
      )}
      {activity.pendientes > 0 && (
        <span className="text-muted-foreground">
          {activity.listas > 0 ? "· " : ""}
          {activity.pendientes} en barra
        </span>
      )}
    </div>
  );
}
