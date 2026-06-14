import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Calculator,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  Undo2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { queueLabel } from "@/lib/comanda-queue";
import {
  METODO_PAGO_LABEL,
  anularPagoApi,
  crearCorteApi,
  fetchCajaComandas,
  fetchCajaResumen,
  fetchCortes,
  registrarPagoApi,
  type CajaResumen,
  type CorteCaja,
  type MetodoPago,
} from "@/lib/caja-api";
import type { Comanda } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

function money(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AdminCaja() {
  const [fecha, setFecha] = useState(todayIso());
  const [resumen, setResumen] = useState<CajaResumen | null>(null);
  const [pendientes, setPendientes] = useState<Comanda[]>([]);
  const [pagadas, setPagadas] = useState<Comanda[]>([]);
  const [cortes, setCortes] = useState<CorteCaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [cobrarId, setCobrarId] = useState<string | null>(null);
  const [metodo, setMetodo] = useState<MetodoPago>("efectivo");
  const [propina, setPropina] = useState("0");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [montoTarjeta, setMontoTarjeta] = useState("");
  const [montoTransferencia, setMontoTransferencia] = useState("");
  const [efectivoContado, setEfectivoContado] = useState("");
  const [notasCorte, setNotasCorte] = useState("");
  const [saving, setSaving] = useState(false);

  const comandaCobrar = pendientes.find((c) => c.id === cobrarId);

  const totalCobrar = useMemo(() => {
    if (!comandaCobrar) return 0;
    return comandaCobrar.total + (Number(propina) || 0);
  }, [comandaCobrar, propina]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [r, p, g, h] = await Promise.all([
        fetchCajaResumen(fecha),
        fetchCajaComandas({ fecha, pagado: false }),
        fetchCajaComandas({ fecha, pagado: true }),
        fetchCortes(20),
      ]);
      setResumen(r);
      setPendientes(p);
      setPagadas(g);
      setCortes(h);
      setEfectivoContado((prev) => (prev === "" ? String(r.efectivoEsperado) : prev));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar caja");
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => {
    setEfectivoContado("");
    void reload();
  }, [fecha, reload]);

  function openCobrar(c: Comanda) {
    setCobrarId(c.id);
    setMetodo("efectivo");
    setPropina("0");
    setMontoEfectivo("");
    setMontoTarjeta("");
    setMontoTransferencia("");
  }

  async function confirmarPago() {
    if (!comandaCobrar) return;
    setSaving(true);
    try {
      const input = {
        metodoPago: metodo,
        propina: Number(propina) || 0,
        ...(metodo === "mixto"
          ? {
              montoEfectivo: Number(montoEfectivo) || 0,
              montoTarjeta: Number(montoTarjeta) || 0,
              montoTransferencia: Number(montoTransferencia) || 0,
            }
          : {}),
      };
      await registrarPagoApi(comandaCobrar.id, input);
      toast.success(`Comanda #${comandaCobrar.folio} cobrada`);
      setCobrarId(null);
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cobrar");
    } finally {
      setSaving(false);
    }
  }

  async function handleAnular(c: Comanda) {
    if (!confirm(`¿Anular el pago de la comanda #${c.folio}?`)) return;
    try {
      await anularPagoApi(c.id);
      toast.success("Pago anulado");
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo anular");
    }
  }

  async function handleCorte() {
    const contado = Number(efectivoContado);
    if (!Number.isFinite(contado) || contado < 0) {
      toast.error("Ingresa el efectivo contado en caja");
      return;
    }
    if (!confirm("¿Cerrar caja del día? No podrás modificar el corte.")) return;
    setSaving(true);
    try {
      await crearCorteApi({ fecha, efectivoContado: contado, notas: notasCorte.trim() || undefined });
      toast.success("Corte de caja registrado");
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cerrar caja");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !resumen) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Caja
          </h2>
          <p className="text-sm text-muted-foreground">Cobros, métodos de pago y corte del día</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-auto" />
          <Button variant="outline" size="icon" onClick={() => void reload()} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {resumen && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Cobrado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{money(resumen.ventasPagadas)}</p>
              <p className="text-xs text-muted-foreground">{resumen.comandasPagadas} comanda(s)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Por cobrar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">{money(resumen.ventasPendientes)}</p>
              <p className="text-xs text-muted-foreground">{resumen.comandasPendientes} comanda(s)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Efectivo en caja</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{money(resumen.efectivoEsperado)}</p>
              <p className="text-xs text-muted-foreground">Incluye propinas en efectivo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Propinas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{money(resumen.propinas)}</p>
              <p className="text-xs text-muted-foreground">
                Tarjeta {money(resumen.tarjetaTotal)} · Transf. {money(resumen.transferenciaTotal)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="cobrar">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="cobrar">Por cobrar ({pendientes.length})</TabsTrigger>
          <TabsTrigger value="pagadas">Cobradas ({pagadas.length})</TabsTrigger>
          <TabsTrigger value="corte">Corte del día</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="cobrar" className="mt-4 space-y-3">
          {pendientes.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No hay comandas pendientes de cobro en esta fecha.
              </CardContent>
            </Card>
          ) : (
            pendientes.map((c) => (
              <Card key={c.id}>
                <CardContent className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">
                      {queueLabel(c.queueOrder)} · #{c.folio} — {c.cliente}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.mesa ?? "Sin mesa"} · {c.items.length} bebida(s) ·{" "}
                      <Badge variant="outline">{c.status}</Badge>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{money(c.total)}</span>
                    <Button onClick={() => openCobrar(c)}>Cobrar</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="pagadas" className="mt-4 space-y-3">
          {pagadas.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">Sin cobros en esta fecha.</CardContent>
            </Card>
          ) : (
            pagadas.map((c) => (
              <Card key={c.id}>
                <CardContent className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      #{c.folio} — {c.cliente}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.metodoPago ? METODO_PAGO_LABEL[c.metodoPago] : "—"}
                      {c.propina ? ` · Propina ${money(c.propina)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{money(c.montoPagado ?? c.total)}</span>
                    {!resumen?.corteCerrado && (
                      <Button variant="ghost" size="sm" onClick={() => void handleAnular(c)}>
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="corte" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Corte del día
              </CardTitle>
              <CardDescription>
                Cuenta el efectivo físico y cierra la caja. Todas las comandas del día deben estar cobradas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resumen?.corteCerrado ? (
                <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                  <p className="font-medium text-green-700">Caja cerrada</p>
                  <p className="text-sm">
                    Efectivo esperado: {money(resumen.efectivoEsperado)} · Contado:{" "}
                    {money(resumen.efectivoContado ?? 0)}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      (resumen.diferencia ?? 0) < 0 ? "text-red-600" : "text-green-700",
                    )}
                  >
                    Diferencia: {money(resumen.diferencia ?? 0)}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Efectivo esperado</p>
                      <p className="text-xl font-bold">{money(resumen?.efectivoEsperado ?? 0)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Tarjeta</p>
                      <p className="text-xl font-bold">{money(resumen?.tarjetaTotal ?? 0)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-muted-foreground">Transferencia</p>
                      <p className="text-xl font-bold">{money(resumen?.transferenciaTotal ?? 0)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="efectivo-contado">Efectivo contado en caja</Label>
                    <Input
                      id="efectivo-contado"
                      type="number"
                      min={0}
                      step="0.01"
                      value={efectivoContado}
                      onChange={(e) => setEfectivoContado(e.target.value)}
                    />
                    {efectivoContado && resumen && (
                      <p className="text-sm text-muted-foreground">
                        Diferencia estimada:{" "}
                        <span
                          className={cn(
                            "font-semibold",
                            Number(efectivoContado) - resumen.efectivoEsperado < 0
                              ? "text-red-600"
                              : "text-green-700",
                          )}
                        >
                          {money(Number(efectivoContado) - resumen.efectivoEsperado)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notas-corte">Notas (opcional)</Label>
                    <Textarea id="notas-corte" value={notasCorte} onChange={(e) => setNotasCorte(e.target.value)} rows={2} />
                  </div>
                  {resumen && resumen.comandasPendientes > 0 && (
                    <p className="text-sm text-amber-600">
                      Faltan {resumen.comandasPendientes} comanda(s) por cobrar antes del corte.
                    </p>
                  )}
                  <Button
                    onClick={() => void handleCorte()}
                    disabled={saving || (resumen?.comandasPendientes ?? 0) > 0}
                    className="gap-2"
                  >
                    <Banknote className="h-4 w-4" />
                    Cerrar caja del día
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-4 space-y-3">
          {cortes.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">Sin cortes registrados.</CardContent>
            </Card>
          ) : (
            cortes.map((c) => (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{c.fecha}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.comandasPagadas} comandas · {c.cerradoPorNombre ?? "Admin"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{money(c.totalVentas)}</p>
                      <p
                        className={cn(
                          "text-sm",
                          c.diferencia < 0 ? "text-red-600" : c.diferencia > 0 ? "text-green-700" : "text-muted-foreground",
                        )}
                      >
                        Dif. {money(c.diferencia)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!cobrarId} onOpenChange={(o) => !o && setCobrarId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cobrar comanda #{comandaCobrar?.folio}</DialogTitle>
          </DialogHeader>
          {comandaCobrar && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {comandaCobrar.cliente} · Total {money(comandaCobrar.total)}
              </p>
              <div className="space-y-2">
                <Label>Método de pago</Label>
                <Select value={metodo} onValueChange={(v) => setMetodo(v as MetodoPago)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="mixto">Mixto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Propina (opcional)</Label>
                <Input type="number" min={0} step="0.01" value={propina} onChange={(e) => setPropina(e.target.value)} />
              </div>
              {metodo === "mixto" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Efectivo</Label>
                    <Input type="number" min={0} value={montoEfectivo} onChange={(e) => setMontoEfectivo(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tarjeta</Label>
                    <Input type="number" min={0} value={montoTarjeta} onChange={(e) => setMontoTarjeta(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Transferencia</Label>
                    <Input
                      type="number"
                      min={0}
                      value={montoTransferencia}
                      onChange={(e) => setMontoTransferencia(e.target.value)}
                    />
                  </div>
                  <p className="sm:col-span-3 text-xs text-muted-foreground">
                    Debe sumar {money(totalCobrar)} (total + propina)
                  </p>
                </div>
              )}
              <p className="text-lg font-bold flex items-center gap-2">
                {metodo === "tarjeta" ? <CreditCard className="h-5 w-5" /> : <Banknote className="h-5 w-5" />}
                A cobrar: {money(totalCobrar)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCobrarId(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void confirmarPago()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar cobro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
