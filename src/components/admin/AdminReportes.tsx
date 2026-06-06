import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { fetchReporte, type PeriodoReporte, type ReporteData } from "@/lib/reportes-api";

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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function money(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
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
    setFecha(todayIso());
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
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">No se pudo cargar el reporte</p>
      )}
    </div>
  );
}
