import { ComandaViewDialog } from "@/components/ComandaViewDialog";
import { Check, Clock, Package, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queueLabel } from "@/lib/comanda-queue";
import { faseOpcionNames, orderItemSubtitle, printComanda, timeAgo } from "@/lib/comanda-display";
import { useMenu } from "@/lib/menu-context";
import type { Comanda } from "@/lib/micheladas-store";

type Props = {
  comanda: Comanda;
  onMarkLista: (id: string) => void;
  onMarkEntregada: (id: string) => void;
  compact?: boolean;
};

export function BarraComandaCard({ comanda: c, onMarkLista, onMarkEntregada, compact }: Props) {
  const { productos } = useMenu();
  const urgent = c.status === "pendiente" && Date.now() - c.createdAt > 10 * 60 * 1000;

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
                Entregada
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
                  {it.micheladaName}
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
                    {it.additions.map((a) => a.name).join(", ")}
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

        <div className="flex flex-wrap gap-2">
          <ComandaViewDialog comanda={c} iconOnly={compact} label={compact ? "Ver" : "Ver comanda"} />
          {c.status === "pendiente" && (
            <Button
              size={compact ? "sm" : "lg"}
              className="flex-1 min-w-[140px] gap-2"
              onClick={() => onMarkLista(c.id)}
            >
              <Check className="h-4 w-4" />
              Lista para servir
            </Button>
          )}
          {c.status === "lista" && (
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
              onClick={() => onMarkEntregada(c.id)}
            >
              <Check className="h-4 w-4" />
              Entregada
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => printComanda(c, productos)}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
