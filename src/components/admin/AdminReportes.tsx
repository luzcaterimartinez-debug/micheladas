import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { localDateIso, formatAppDateTime, formatAppMoney } from "@/lib/local-date";
import {
  fetchReporte,
  type PeriodoReporte,
  type ReporteData,
  type ReportePedido,
} from "@/lib/reportes-api";

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  lista: "Lista",
  entregada: "Entregada",
};

const METODO_LABEL: Record<string, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  mixto: "Mixto",
};

function money(n: number) {
  return formatAppMoney(n, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function toppingLabel(raw: string) {
  return raw
    .replace(/^tipo_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function PedidosList({ pedidos, totalComandas }: { pedidos: ReportePedido[]; totalComandas: number }) {
  if (pedidos.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">Sin pedidos en el periodo</p>;
  }

  return (
    <div className="space-y-3">
      {totalComandas > pedidos.length && (
        <p className="text-xs text-muted-foreground">
          Mostrando los {pedidos.length} más recientes de {totalComandas} pedidos.
        </p>
      )}
      <Accordion type="multiple" className="rounded-lg border px-3">
        {pedidos.map((p) => {
          const itemCount = p.items.reduce((s, it) => s + it.cantidad, 0);
          return (
            <AccordionItem key={p.id} value={p.id}>
              <AccordionTrigger className="hover:no-underline py-3 gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      #{p.folio}
                      <span className="text-muted-foreground font-normal"> · T{p.queueOrder}</span>
                      {" — "}
                      {p.cliente}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.createdAt ? formatAppDateTime(p.createdAt) : "—"}
                      {" · "}
                      {p.mesa ?? "Sin mesa"}
                      {p.meseroNombre ? ` · ${p.meseroNombre}` : ""}
                      {" · "}
                      {itemCount} bebida{itemCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Badge variant="outline">{ESTADO_LABEL[p.status] ?? p.status}</Badge>
                    <Badge variant={p.pagado ? "default" : "secondary"}>
                      {p.pagado
                        ? p.metodoPago
                          ? METODO_LABEL[p.metodoPago] ?? p.metodoPago
                          : "Pagado"
                        : "Sin cobrar"}
                    </Badge>
                    <span className="text-sm font-bold tabular-nums">{money(p.total)}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="divide-y rounded-md border bg-muted/30">
                  {p.items.map((it, idx) => {
                    const extras = [
                      it.size,
                      ...it.toppings.map(toppingLabel),
                      ...it.additions,
                    ].filter(Boolean) as string[];
                    return (
                      <li key={`${p.id}-${idx}`} className="flex items-start justify-between gap-3 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {it.cantidad > 1 ? `${it.cantidad}× ` : ""}
                            {it.productoNombre}
                          </p>
                          {extras.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {extras.join(" · ")}
                            </p>
                          )}
                          {it.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">“{it.notes}”</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold tabular-nums shrink-0">
                          {money(it.total)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function SerieChart({ serie }: { serie: ReporteData["serie"] }) {
  const max = Math.max(...serie.map((p) => p.total), 1);
  if (serie.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">Sin ventas en el periodo</p>;
  }
  return (
    <div className="flex items-end gap-1 sm:gap-2 h-40 pt-2 overflow-x-auto pb-1">
      {serie.map((p) => (
        <div key={p.label} className="flex flex-col items-center gap-1 min-w-[2rem] flex-1">
          <span className="text-[10px] text-muted-foreground tabular-nums">{money(p.total)}</span>
          <div
            className="w-full max-w-12 mx-auto rounded-t bg-primary/80 min-h-[4px] transition-all"
            style={{ height: `${Math.max(8, (p.total / max) * 120)}px` }}
            title={`${p.count} comandas`}
          />
          <span className="text-[10px] font-medium text-muted-foreground">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Sin datos</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            {headers.map((h) => (
              <th key={h} className="pb-2 pr-4 last:pr-0 last:text-right">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    "py-2 pr-4 last:pr-0",
                    j === row.length - 1 && "text-right font-medium tabular-nums",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminReportes() {
  const [periodo, setPeriodo] = useState<PeriodoReporte>("dia");
  const [fecha, setFecha] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [filtersReady, setFiltersReady] = useState(false);
  const [reporte, setReporte] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [yearBase, setYearBase] = useState(2026);

  useEffect(() => {
    const now = new Date();
    setFecha(localDateIso(now));
    setAnio(String(now.getFullYear()));
    setMes(String(now.getMonth() + 1));
    setYearBase(now.getFullYear());
    setFiltersReady(true);
  }, []);

  const params = useMemo(() => {
    if (!filtersReady) return null;
    if (periodo === "dia") return { periodo, fecha };
    if (periodo === "mes") return { periodo, anio: Number(anio), mes: Number(mes) };
    return { periodo, anio: Number(anio) };
  }, [periodo, fecha, anio, mes, filtersReady]);

  const load = useCallback(async () => {
    if (!params) return;
    setLoading(true);
    try {
      setReporte(await fetchReporte(params));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar reporte");
      setReporte(null);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void load();
  }, [load]);

  const years = useMemo(() => [yearBase, yearBase - 1, yearBase - 2], [yearBase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            Reportes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Ventas y operación filtradas por día, mes o año.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Periodo
          </CardTitle>
          <CardDescription>Elige cómo agrupar las comandas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "dia" as const, label: "Por día" },
                { id: "mes" as const, label: "Por mes" },
                { id: "anio" as const, label: "Por año" },
              ] as const
            ).map((p) => (
              <Button
                key={p.id}
                type="button"
                variant={periodo === p.id ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriodo(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {periodo === "dia" && (
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="fecha-reporte">Fecha</Label>
              <Input
                id="fecha-reporte"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          )}

          {periodo === "mes" && (
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2 w-36">
                <Label>Año</Label>
                <Select value={anio} onValueChange={setAnio}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-44">
                <Label>Mes</Label>
                <Select value={mes} onValueChange={setMes}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {periodo === "anio" && (
            <div className="space-y-2 w-36">
              <Label>Año</Label>
              <Select value={anio} onValueChange={setAnio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {!filtersReady || loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reporte ? (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{reporte.label}</span>
            {reporte.desde !== reporte.hasta && (
              <>
                {" "}
                · {reporte.desde} — {reporte.hasta}
              </>
            )}
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ventas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{money(reporte.totalVentas)}</p>
                <p className="text-xs text-muted-foreground mt-1">{reporte.numComandas} comandas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ticket promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{money(reporte.ticketPromedio)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bebidas vendidas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{reporte.numItems}</p>
                <p className="text-xs text-muted-foreground mt-1">líneas en pedidos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Por estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {reporte.porEstado.length === 0 ? (
                  <p className="text-muted-foreground">—</p>
                ) : (
                  reporte.porEstado.map((e) => (
                    <div key={e.status} className="flex justify-between gap-2">
                      <span>{ESTADO_LABEL[e.status] ?? e.status}</span>
                      <span className="tabular-nums">
                        {e.count} · {money(e.total)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {periodo === "dia" ? "Ventas por hora" : periodo === "mes" ? "Ventas por día" : "Ventas por mes"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SerieChart serie={reporte.serie} />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Productos más vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  headers={["Producto", "Cant.", "Total"]}
                  rows={reporte.topProductos.map((p) => [
                    p.productoNombre,
                    p.cantidad,
                    money(p.total),
                  ])}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Por mesa</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  headers={["Mesa", "Comandas", "Total"]}
                  rows={reporte.porMesa.map((m) => [m.mesa, m.count, money(m.total)])}
                />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Por mesero</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  headers={["Mesero", "Comandas", "Total"]}
                  rows={reporte.porMesero.map((m) => [
                    m.meseroNombre,
                    m.count,
                    money(m.total),
                  ])}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Pedidos del periodo
              </CardTitle>
              <CardDescription>
                Toca un pedido para ver productos, adiciones y notas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PedidosList pedidos={reporte.pedidos} totalComandas={reporte.numComandas} />
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No se pudo cargar el reporte</p>
      )}
    </div>
  );
}
