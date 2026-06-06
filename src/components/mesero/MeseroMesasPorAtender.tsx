import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ComandaViewDialog } from "@/components/ComandaViewDialog";
import type { Comanda, Mesa } from "@/lib/micheladas-store";
import { getMesaActivity, getMesasPorAtender } from "@/lib/pos-utils";
import { cn } from "@/lib/utils";

type Props = {
  mesas: Mesa[];
  comandas: Comanda[];
  meseroId?: number;
  onMarcarAtendida: (mesaId: string) => Promise<void>;
  onReloadComandas?: () => Promise<void>;
  className?: string;
};

export function MeseroMesasPorAtender({
  mesas,
  comandas,
  meseroId,
  onMarcarAtendida,
  onReloadComandas,
  className,
}: Props) {
  const [expanded, setExpanded] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const porAtender = useMemo(
    () => getMesasPorAtender(mesas, comandas, meseroId),
    [mesas, comandas, meseroId],
  );

  if (porAtender.length === 0) return null;

  async function atender(mesa: Mesa) {
    const activity = getMesaActivity(mesa.id, comandas);
    if (activity.pendientes > 0) {
      const ok = window.confirm(
        `Mesa ${mesa.nombre} tiene ${activity.pendientes} pedido(s) aún en barra. ¿Marcar como atendida igual?`,
      );
      if (!ok) return;
    }
    setLoadingId(mesa.id);
    try {
      await onMarcarAtendida(mesa.id);
      await onReloadComandas?.();
      toast.success(`${mesa.nombre} libre`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo liberar la mesa");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section className={cn("rounded-xl border border-dashed bg-muted/30", className)}>
      <button
        type="button"
        className="w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Mesas en servicio · {porAtender.length}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <ul className="border-t divide-y divide-border/60 px-3 pb-2">
          {porAtender.map((mesa) => {
            const activity = getMesaActivity(mesa.id, comandas);
            const ultima = activity.activas[0] ?? comandas.find((c) => c.mesaId === mesa.id);
            return (
              <li key={mesa.id} className="py-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{mesa.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {mesa.cliente ?? ultima?.cliente ?? "Sin nombre"}
                    {activity.totalCuenta > 0 && (
                      <span className="tabular-nums"> · ${activity.totalCuenta}</span>
                    )}
                  </p>
                  {activity.listas > 0 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {activity.listas} listo{activity.listas === 1 ? "" : "s"} para servir
                    </p>
                  )}
                  {activity.pendientes > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      {activity.pendientes} en barra
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {ultima && activity.activas.length > 0 && (
                    <ComandaViewDialog comanda={ultima} size="sm" variant="ghost" label="Detalle" />
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1 h-9"
                    disabled={loadingId === mesa.id}
                    onClick={() => void atender(mesa)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {loadingId === mesa.id ? "…" : "Atendida"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
