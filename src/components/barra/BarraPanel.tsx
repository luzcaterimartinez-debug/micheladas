import { useMemo, useState } from "react";
import { Check, Clock, Package, RefreshCw } from "lucide-react";
import { PosHeader } from "@/components/PosHeader";
import { toast } from "sonner";

import { BarraAutoPrintBanner } from "@/components/barra/BarraAutoPrintBanner";
import { BarraComandaCard } from "@/components/barra/BarraComandaCard";
import {
  isAutoPrintEnabled,
  setAutoPrintEnabled,
  useAutoPrintComandas,
} from "@/hooks/use-auto-print-comandas";
import { useMenu } from "@/lib/menu-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { sortComandasByQueue } from "@/lib/comanda-queue";
import { useComandas, type Comanda } from "@/lib/micheladas-store";

type FilterTab = "activas" | "listas" | "historial";

type BarraPanelProps = {
  userName: string;
  onLogout: () => void;
};

function ColumnHeader({
  title,
  count,
  icon: Icon,
  accent,
}: {
  title: string;
  count: number;
  icon: typeof Clock;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2 mb-3",
        accent ? "bg-primary/10 text-primary" : "bg-muted",
      )}
    >
      <div className="flex items-center gap-2 font-semibold text-sm">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <span
        className={cn(
          "text-xs font-bold rounded-full px-2.5 py-0.5",
          accent ? "bg-primary text-primary-foreground" : "bg-background",
        )}
      >
        {count}
      </span>
    </div>
  );
}

export function BarraPanel({ userName, onLogout }: BarraPanelProps) {
  const { comandas, updateStatus } = useComandas();
  const { productos } = useMenu();
  const [autoPrint, setAutoPrint] = useState(isAutoPrintEnabled);
  const [mobileTab, setMobileTab] = useState<FilterTab>("activas");
  const [showHistorial, setShowHistorial] = useState(false);

  const { lastPrinted, printedCount } = useAutoPrintComandas(comandas, productos, autoPrint);

  function toggleAutoPrint(v: boolean) {
    setAutoPrintEnabled(v);
    setAutoPrint(v);
  }

  const pendientes = useMemo(
    () => comandas.filter((c) => c.status === "pendiente").sort(sortComandasByQueue),
    [comandas],
  );
  const listas = useMemo(
    () => comandas.filter((c) => c.status === "lista").sort(sortComandasByQueue),
    [comandas],
  );
  const entregadas = useMemo(
    () =>
      comandas
        .filter((c) => c.status === "entregada")
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20),
    [comandas],
  );

  async function markLista(id: string) {
    try {
      await updateStatus(id, "lista");
      toast.success("Comanda lista para el mesero");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  async function markEntregada(id: string) {
    try {
      await updateStatus(id, "entregada");
      toast.success("Comanda entregada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  }

  const emptyPendientes = pendientes.length === 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PosHeader
        title="Barra"
        userName={userName}
        onLogout={onLogout}
        containerClassName="max-w-7xl"
        badge={
          pendientes.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 text-foreground text-[11px] font-medium px-2 py-1 tabular-nums">
              <Clock className="h-3 w-3 opacity-60" />
              {pendientes.length}
            </span>
          ) : undefined
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-4">
        <BarraAutoPrintBanner
          enabled={autoPrint}
          onEnabledChange={toggleAutoPrint}
          lastPrinted={lastPrinted}
          printedCount={printedCount}
        />

        {/* Escritorio: columnas kanban */}
        <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <section>
            <ColumnHeader
              title="Por preparar"
              count={pendientes.length}
              icon={Clock}
              accent={pendientes.length > 0}
            />
            {emptyPendientes ? (
              <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Sin pedidos pendientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendientes.map((c) => (
                  <BarraComandaCard
                    key={c.id}
                    comanda={c}
                    onMarkLista={markLista}
                    onMarkEntregada={markEntregada}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <ColumnHeader title="Listas para mesero" count={listas.length} icon={Package} />
            {listas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-xl">
                Nada listo aún
              </p>
            ) : (
              <div className="space-y-4">
                {listas.map((c) => (
                  <BarraComandaCard
                    key={c.id}
                    comanda={c}
                    onMarkLista={markLista}
                    onMarkEntregada={markEntregada}
                    compact
                  />
                ))}
              </div>
            )}
          </section>

          <section className="xl:block hidden">
            <ColumnHeader title="Entregadas hoy" count={entregadas.length} icon={Check} />
            {entregadas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">—</p>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {entregadas.map((c) => (
                  <BarraComandaCard
                    key={c.id}
                    comanda={c}
                    onMarkLista={markLista}
                    onMarkEntregada={markEntregada}
                    compact
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Móvil / tablet */}
        <div className="lg:hidden">
          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as FilterTab)}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="activas" className="gap-1 text-xs sm:text-sm">
                <Clock className="h-3.5 w-3.5" />
                Cola ({pendientes.length})
              </TabsTrigger>
              <TabsTrigger value="listas" className="gap-1 text-xs sm:text-sm">
                <Package className="h-3.5 w-3.5" />
                Listas ({listas.length})
              </TabsTrigger>
              <TabsTrigger value="historial" className="gap-1 text-xs sm:text-sm">
                <Check className="h-3.5 w-3.5" />
                Hechas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activas" className="space-y-4 mt-0">
              {pendientes.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Sin pedidos en cola</p>
              ) : (
                pendientes.map((c) => (
                  <BarraComandaCard
                    key={c.id}
                    comanda={c}
                    onMarkLista={markLista}
                    onMarkEntregada={markEntregada}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="listas" className="space-y-4 mt-0">
              {listas.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Sin comandas listas</p>
              ) : (
                listas.map((c) => (
                  <BarraComandaCard
                    key={c.id}
                    comanda={c}
                    onMarkLista={markLista}
                    onMarkEntregada={markEntregada}
                    compact
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="historial" className="space-y-3 mt-0">
              {entregadas.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Sin entregas recientes</p>
              ) : (
                entregadas.map((c) => (
                  <BarraComandaCard
                    key={c.id}
                    comanda={c}
                    onMarkLista={markLista}
                    onMarkEntregada={markEntregada}
                    compact
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Historial en pantallas medianas */}
        <div className="hidden md:block lg:hidden mt-6">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setShowHistorial((v) => !v)}
          >
            {showHistorial ? "Ocultar" : "Ver"} entregadas ({entregadas.length})
          </Button>
          {showHistorial && (
            <div className="mt-3 space-y-3">
              {entregadas.map((c) => (
                <BarraComandaCard
                  key={c.id}
                  comanda={c}
                  onMarkLista={markLista}
                  onMarkEntregada={markEntregada}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
