import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { queueLabel, sortComandasByQueue } from "@/lib/comanda-queue";
import { faseOpcionNames, orderItemLabel } from "@/lib/comanda-display";
import { useMenu } from "@/lib/menu-context";
import { useComandas, type Comanda } from "@/lib/micheladas-store";
import { ComandaViewDialog } from "@/components/ComandaViewDialog";
import { Check, Clock, Trash2, Package } from "lucide-react";

const STATUS_META: Record<Comanda["status"], { label: string; cls: string; icon: typeof Clock }> = {
  pendiente: { label: "Pendiente", cls: "bg-accent text-accent-foreground", icon: Clock },
  lista: { label: "Lista", cls: "bg-secondary text-secondary-foreground", icon: Package },
  entregada: { label: "Entregada", cls: "bg-muted text-muted-foreground", icon: Check },
};

export function ComandasList() {
  const { productos } = useMenu();
  const { comandas, updateStatus, remove } = useComandas();

  if (comandas.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>Sin comandas todavía. Toma el primer pedido del día.</p>
      </div>
    );
  }

  const sorted = [...comandas].sort(sortComandasByQueue);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((c) => {
        const meta = STATUS_META[c.status];
        const Icon = meta.icon;
        return (
          <Card key={c.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-bold px-2 py-0.5 tabular-nums">
                    {queueLabel(c.queueOrder)}
                  </span>
                  <span>
                    #{c.folio} · {c.cliente}
                  </span>
                  {c.mesa && <span className="text-sm font-normal text-muted-foreground"> · {c.mesa}</span>}
                </CardTitle>
                <Badge className={meta.cls}>
                  <Icon className="h-3 w-3 mr-1" />
                  {meta.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(c.createdAt).toLocaleTimeString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm">
                {c.items.map((it) => (
                  <li key={it.id} className="border-l-2 border-primary/40 pl-3">
                    <div className="flex justify-between font-medium">
                      <span>{orderItemLabel(it)}</span>
                      <span>${it.total}</span>
                    </div>
                    {it.selectedToppings.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        +{" "}
                        {faseOpcionNames(it.micheladaId, it.selectedToppings, productos).join(", ")}
                      </p>
                    )}
                    {it.additions.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Adiciones: {it.additions.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    {it.notes && (
                      <p className="text-xs italic text-muted-foreground">"{it.notes}"</p>
                    )}
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-bold text-lg">${c.total}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <ComandaViewDialog comanda={c} />
                {c.status === "pendiente" && (
                  <Button size="sm" onClick={() => void updateStatus(c.id, "lista")}>
                    Marcar lista
                  </Button>
                )}
                {c.status === "lista" && (
                  <Button size="sm" onClick={() => void updateStatus(c.id, "entregada")}>
                    Entregar
                  </Button>
                )}
                <ComandaViewDialog comanda={c} trigger="print" label="Ticket" size="sm" variant="outline" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void remove(c.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
