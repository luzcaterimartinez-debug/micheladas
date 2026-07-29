import { ComandaViewDialog } from "@/components/ComandaViewDialog";
import { Check, Clock, Package } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queueLabel } from "@/lib/comanda-queue";
import { faseOpcionNames, orderItemLabel, orderItemSubtitle, timeAgo } from "@/lib/comanda-display";
import { useMenu } from "@/lib/menu-context";
import type { Comanda } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

type Props = {
  comanda: Comanda;
  onMarkLista: (id: string) => void | Promise<void>;
  onMarkEntregada: (id: string) => void | Promise<void>;
  compact?: boolean;
};

export function BarraComandaCard({ comanda: c, onMarkLista, onMarkEntregada, compact }: Props) {
  const { productos } = useMenu();
  const [busy, setBusy] = useState<"lista" | "atendido" | null>(null);
  const urgent = c.status === "pendiente" && Date.now() - c.createdAt > 10 * 60 * 1000;
  const canComplete = c.status === "pendiente" || c.status === "lista";

  async function run(action: "lista" | "atendido", fn: () => void | Promise<void>) {
    if (busy) return;
    setBusy(action);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card
      className={
        c.status === "pendiente"
          ? urgent
            ? "border-destructive ring-1 ring-destructive/30"
            : "border-primary/40"
          : ""
      }
    >
      <CardHeader className={compact ? "pb-2 pt-4 px-4" : "pb-3"}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className={
                compact
                  ? "text-2xl font-black tabular-nums leading-none text-primary"
                  : "text-3xl font-black tabular-nums leading-none text-primary"
              }
            >
              {queueLabel(c.queueOrder)}
            </p>
            <CardTitle className={compact ? "text-sm text-muted-foreground mt-1" : "text-sm text-muted-foreground mt-1.5"}>
              Folio #{c.folio}
            </CardTitle>
            <p className="text-sm font-medium mt-0.5">{c.cliente}</p>
            {c.mesa && (
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1">
                {c.mesa}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            {c.status === "pendiente" && (
              <Badge className="bg-accent text-accent-foreground gap-1">
                <Clock className="h-3 w-3" />
                Preparar
              </Badge>
            )}
            {c.status === "lista" && (
              <Badge className="bg-secondary text-secondary-foreground gap-1">
                <Package className="h-3 w-3" />
                Lista
              </Badge>
            )}
            {c.status === "entregada" && (
              <Badge variant="outline" className="gap-1">
                <Check className="h-3 w-3" />
                Atendido
              </Badge>
            )}
            <p className="text-xs text-muted-foreground mt-1">{timeAgo(c.createdAt)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? "px-4 pb-4 space-y-3" : "space-y-4"}>
        <ul className="space-y-3">
          {c.items.map((it) => {
            const tops = faseOpcionNames(it.micheladaId, it.selectedToppings, productos);
            const subtitle = orderItemSubtitle(it);
            return (
              <li
                key={it.id}
                className="rounded-lg bg-muted/50 p-3 border-l-4 border-primary"
              >
                <p className={`font-bold ${compact ? "text-base" : "text-lg"}`}>
                  {orderItemLabel(it)}
                </p>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
                {tops.length > 0 && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Toppings:</span> {tops.join(", ")}
                  </p>
                )}
                {it.additions.length > 0 && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Adiciones:</span>{" "}
                    {it.additions
                      .map((a) => {
                        const q = Math.max(1, a.quantity ?? 1);
                        return q > 1 ? `${q}× ${a.name}` : a.name;
                      })
                      .join(", ")}
                  </p>
                )}
                {it.notes && (
                  <p className="text-sm mt-2 font-medium text-destructive bg-destructive/10 rounded px-2 py-1">
                    {it.notes}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-2">
          {canComplete && (
            <Button
              type="button"
              size="lg"
              className={cn(
                "w-full min-h-14 gap-2 text-base font-bold touch-manipulation",
                "bg-emerald-600 hover:bg-emerald-700 text-white",
              )}
              disabled={busy !== null}
              onClick={() => void run("atendido", () => onMarkEntregada(c.id))}
            >
              <Check className="h-5 w-5" />
              {busy === "atendido" ? "Marcando…" : "Atendido"}
            </Button>
          )}
          <div className="flex flex-wrap gap-2">
            <ComandaViewDialog comanda={c} iconOnly={compact} label={compact ? "Ver" : "Ver comanda"} />
            {c.status === "pendiente" && (
              <Button
                type="button"
                size={compact ? "default" : "lg"}
                variant="secondary"
                className="flex-1 min-h-11 gap-2 touch-manipulation"
                disabled={busy !== null}
                onClick={() => void run("lista", () => onMarkLista(c.id))}
              >
                <Package className="h-4 w-4" />
                {busy === "lista" ? "…" : "Lista (mesero)"}
              </Button>
            )}
            <ComandaViewDialog comanda={c} trigger="print" iconOnly size="sm" variant="outline" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
