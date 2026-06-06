import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Calendar,
  HandCoins,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ROL_LABELS, type Rol } from "@/lib/auth";
import {
  DIAS_REF_TIPO,
  TIPO_PAGO_LABEL,
  createNominaPrestamo,
  createNominaRecibo,
  deleteNominaPrestamo,
  deleteNominaRecibo,
  fetchNominaPeriodo,
  updateNominaPrestamo,
  updateNominaRecibo,
  upsertNominaConfig,
  type NominaEmpleado,
  type NominaPeriodo,
  type NominaPrestamo,
  type TipoPago,
} from "@/lib/nomina-api";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function money(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type ConfigForm = {
  salarioBase: string;
  tipoPago: TipoPago;
  tarifaHoraExtra: string;
  puesto: string;
};

type ReciboForm = {
  diasTrabajados: string;
  horasExtra: string;
  bonos: string;
  deducciones: string;
  descuentoPrestamos: string;
  aplicarPrestamosAuto: boolean;
  notas: string;
};

type PrestamoForm = {
  concepto: string;
  montoTotal: string;
  cuotaPeriodo: string;
};

export function AdminNomina() {
  const now = new Date();
  const [anio, setAnio] = useState(String(now.getFullYear()));
  const [mes, setMes] = useState(String(now.getMonth() + 1));
  const [modoPeriodo, setModoPeriodo] = useState<"mes" | "q1" | "q2">("q1");
  const [periodo, setPeriodo] = useState<NominaPeriodo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [configTarget, setConfigTarget] = useState<NominaEmpleado | null>(null);
  const [configForm, setConfigForm] = useState<ConfigForm>({
    salarioBase: "",
    tipoPago: "quincenal",
    tarifaHoraExtra: "",
    puesto: "",
  });

  const [reciboTarget, setReciboTarget] = useState<NominaEmpleado | null>(null);
  const [reciboForm, setReciboForm] = useState<ReciboForm>({
    diasTrabajados: "15",
    horasExtra: "0",
    bonos: "0",
    deducciones: "0",
    descuentoPrestamos: "0",
    aplicarPrestamosAuto: true,
    notas: "",
  });

  const [prestamoTarget, setPrestamoTarget] = useState<NominaEmpleado | null>(null);
  const [prestamoForm, setPrestamoForm] = useState<PrestamoForm>({
    concepto: "",
    montoTotal: "",
    cuotaPeriodo: "",
  });

  const quincena = modoPeriodo === "q1" ? 1 : modoPeriodo === "q2" ? 2 : null;

  const load = useCallback(async (): Promise<NominaPeriodo | null> => {
    setLoading(true);
    try {
      const data = await fetchNominaPeriodo({
        anio: Number(anio),
        mes: Number(mes),
        quincena,
      });
      setPeriodo(data);
      return data;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar nómina");
      setPeriodo(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [anio, mes, quincena]);

  useEffect(() => {
    void load();
  }, [load]);

  const years = useMemo(() => {
    const y = now.getFullYear();
    return [y, y - 1];
  }, [now]);

  const diasRef = configForm.tipoPago ? DIAS_REF_TIPO[configForm.tipoPago] : 15;

  function openConfig(emp: NominaEmpleado) {
    setConfigTarget(emp);
    setConfigForm({
      salarioBase: emp.config ? String(emp.config.salarioBase) : "",
      tipoPago: emp.config?.tipoPago ?? "quincenal",
      tarifaHoraExtra: emp.config?.tarifaHoraExtra != null ? String(emp.config.tarifaHoraExtra) : "",
      puesto: emp.config?.puesto ?? "",
    });
  }

  function openRecibo(emp: NominaEmpleado) {
    if (!emp.config) {
      toast.error("Primero configura el salario del empleado");
      return;
    }
    setReciboTarget(emp);
    const ref = DIAS_REF_TIPO[emp.config.tipoPago];
    const sugerido = emp.descuentoPrestamosSugerido;
    setReciboForm({
      diasTrabajados: emp.recibo ? String(emp.recibo.diasTrabajados) : String(ref),
      horasExtra: emp.recibo ? String(emp.recibo.horasExtra) : "0",
      bonos: emp.recibo ? String(emp.recibo.bonos) : "0",
      deducciones: emp.recibo ? String(emp.recibo.deducciones) : "0",
      descuentoPrestamos: emp.recibo
        ? String(emp.recibo.descuentoPrestamos)
        : sugerido > 0
          ? String(sugerido)
          : "0",
      aplicarPrestamosAuto: !emp.recibo,
      notas: emp.recibo?.notas ?? "",
    });
  }

  function saldoPrestamos(emp: NominaEmpleado) {
    return emp.prestamos
      .filter((p) => p.activo && p.saldoPendiente > 0)
      .reduce((s, p) => s + p.saldoPendiente, 0);
  }

  function openPrestamos(emp: NominaEmpleado) {
    setPrestamoTarget(emp);
    setPrestamoForm({ concepto: "", montoTotal: "", cuotaPeriodo: "" });
  }

  async function addPrestamo() {
    if (!prestamoTarget) return;
    const monto = Number(prestamoForm.montoTotal);
    const cuota = Number(prestamoForm.cuotaPeriodo);
    if (!prestamoForm.concepto.trim()) {
      toast.error("Indica el concepto del préstamo");
      return;
    }
    if (!Number.isFinite(monto) || monto <= 0 || !Number.isFinite(cuota) || cuota <= 0) {
      toast.error("Monto y cuota deben ser mayores a cero");
      return;
    }
    setSaving(true);
    try {
      await createNominaPrestamo({
        usuarioId: prestamoTarget.usuarioId,
        concepto: prestamoForm.concepto.trim(),
        montoTotal: monto,
        cuotaPeriodo: cuota,
      });
      toast.success("Préstamo registrado");
      setPrestamoForm({ concepto: "", montoTotal: "", cuotaPeriodo: "" });
      const uid = prestamoTarget.usuarioId;
      const data = await load();
      const refreshed = data?.empleados.find((e) => e.usuarioId === uid);
      if (refreshed) setPrestamoTarget(refreshed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo registrar préstamo");
    } finally {
      setSaving(false);
    }
  }

  async function togglePrestamoActivo(p: NominaPrestamo, activo: boolean) {
    setSaving(true);
    try {
      await updateNominaPrestamo(p.id, { activo });
      toast.success(activo ? "Préstamo reactivado" : "Préstamo pausado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function removePrestamo(p: NominaPrestamo) {
    setSaving(true);
    try {
      await deleteNominaPrestamo(p.id);
      toast.success("Préstamo eliminado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  async function saveConfig() {
    if (!configTarget) return;
    const salario = Number(configForm.salarioBase);
    if (!Number.isFinite(salario) || salario < 0) {
      toast.error("Salario inválido");
      return;
    }
    setSaving(true);
    try {
      await upsertNominaConfig(configTarget.usuarioId, {
        salarioBase: salario,
        tipoPago: configForm.tipoPago,
        tarifaHoraExtra: configForm.tarifaHoraExtra.trim()
          ? Number(configForm.tarifaHoraExtra)
          : undefined,
        puesto: configForm.puesto.trim() || undefined,
      });
      toast.success("Configuración guardada");
      setConfigTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function saveRecibo() {
    if (!reciboTarget || !periodo) return;
    const descManual = Number(reciboForm.descuentoPrestamos);
    const payload = {
      diasTrabajados: Number(reciboForm.diasTrabajados) || 0,
      horasExtra: Number(reciboForm.horasExtra) || 0,
      bonos: Number(reciboForm.bonos) || 0,
      deducciones: Number(reciboForm.deducciones) || 0,
      descuentoPrestamos: Number.isFinite(descManual) ? descManual : undefined,
      aplicarPrestamosAuto: reciboForm.aplicarPrestamosAuto,
      notas: reciboForm.notas.trim() || undefined,
    };
    setSaving(true);
    try {
      if (reciboTarget.recibo) {
        await updateNominaRecibo(reciboTarget.recibo.id, payload);
        toast.success("Recibo actualizado");
      } else {
        await createNominaRecibo({
          usuarioId: reciboTarget.usuarioId,
          anio: periodo.anio,
          mes: periodo.mes,
          quincena: periodo.quincena,
          ...payload,
        });
        toast.success("Recibo generado");
      }
      setReciboTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar recibo");
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(emp: NominaEmpleado) {
    if (!emp.recibo) return;
    setSaving(true);
    try {
      await updateNominaRecibo(emp.recibo.id, { estado: "pagado" });
      toast.success("Marcado como pagado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function removeRecibo(emp: NominaEmpleado) {
    if (!emp.recibo) return;
    setSaving(true);
    try {
      await deleteNominaRecibo(emp.recibo.id);
      toast.success("Recibo eliminado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  const activos = periodo?.empleados.filter((e) => e.activo) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            Nómina
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sueldos, préstamos a empleados, descuentos en recibos y control de pagos.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 w-full sm:w-auto min-h-10 sm:min-h-0"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Periodo de pago
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
          <div className="space-y-2 sm:w-28">
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
          <div className="space-y-2 sm:w-40">
            <Label>Mes</Label>
            <Select value={mes} onValueChange={setMes}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((label, i) => (
                  <SelectItem key={label} value={String(i + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <Label>Corte</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "mes" as const, label: "Mes completo" },
                  { id: "q1" as const, label: "1ª quincena" },
                  { id: "q2" as const, label: "2ª quincena" },
                ] as const
              ).map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  size="sm"
                  variant={modoPeriodo === p.id ? "default" : "outline"}
                  onClick={() => setModoPeriodo(p.id)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : periodo ? (
        <>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{periodo.label}</span>
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total neto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{money(periodo.resumen.totalNeto)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Pagado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-emerald-600">{money(periodo.resumen.totalPagado)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {periodo.resumen.empleadosPagados} de {periodo.resumen.empleadosConRecibo} recibos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Bruto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{money(periodo.resumen.totalBruto)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Desc. préstamos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-700">
                  {money(periodo.resumen.totalPrestamos)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {periodo.resumen.prestamosActivos} empleado(s) con saldo
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Empleados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{activos.length}</p>
                <p className="text-xs text-muted-foreground mt-1">usuarios activos</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recibos del periodo</CardTitle>
              <CardDescription>
                Configura salario, captura días trabajados y marca como pagado cuando liquides.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="md:hidden space-y-3">
                {activos.map((emp) => (
                  <div key={emp.usuarioId} className="rounded-xl border p-3 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{emp.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {ROL_LABELS[emp.rol as Rol] ?? emp.rol}
                          {emp.config?.puesto ? ` · ${emp.config.puesto}` : ""}
                        </p>
                      </div>
                      {emp.recibo ? (
                        <Badge variant={emp.recibo.estado === "pagado" ? "secondary" : "outline"}>
                          {emp.recibo.estado === "pagado" ? "Pagado" : "Borrador"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground shrink-0">Sin recibo</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold text-sm tabular-nums">
                          {emp.recibo ? money(emp.recibo.total) : "—"}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2">
                        <p className="text-muted-foreground">Préstamos</p>
                        <p className="font-semibold text-sm tabular-nums text-amber-700">
                          {saldoPrestamos(emp) > 0 ? money(saldoPrestamos(emp)) : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openConfig(emp)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Salario
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => openPrestamos(emp)}>
                        <HandCoins className="h-3.5 w-3.5 mr-1" />
                        Préstamos
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openRecibo(emp)}
                        disabled={!emp.config}
                      >
                        {emp.recibo ? "Editar recibo" : "Generar"}
                      </Button>
                      {emp.recibo?.estado === "borrador" && (
                        <Button type="button" size="sm" onClick={() => void markPaid(emp)} disabled={saving}>
                          <Banknote className="h-3.5 w-3.5 mr-1" />
                          Pagar
                        </Button>
                      )}
                      {emp.recibo && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => void removeRecibo(emp)}
                          disabled={saving}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-3">Empleado</th>
                    <th className="pb-2 pr-3">Puesto / pago</th>
                    <th className="pb-2 pr-3 text-right">Préstamos</th>
                    <th className="pb-2 pr-3">Días</th>
                    <th className="pb-2 pr-3 text-right">Total</th>
                    <th className="pb-2 pr-3">Estado</th>
                    <th className="pb-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activos.map((emp) => (
                    <tr key={emp.usuarioId} className="border-b last:border-0">
                      <td className="py-3 pr-3">
                        <p className="font-medium">{emp.nombre}</p>
                        <p className="text-xs text-muted-foreground">
                          {ROL_LABELS[emp.rol as Rol] ?? emp.rol}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        {emp.config ? (
                          <div className="text-xs">
                            <p>{emp.config.puesto || "—"}</p>
                            <p className="text-muted-foreground">
                              {money(emp.config.salarioBase)} · {TIPO_PAGO_LABEL[emp.config.tipoPago]}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600">Sin configurar</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums">
                        {saldoPrestamos(emp) > 0 ? (
                          <div>
                            <p className="text-amber-700 font-medium">{money(saldoPrestamos(emp))}</p>
                            {emp.descuentoPrestamosSugerido > 0 && (
                              <p className="text-xs text-muted-foreground">
                                cuota: {money(emp.descuentoPrestamosSugerido)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 tabular-nums">
                        {emp.recibo ? emp.recibo.diasTrabajados : "—"}
                      </td>
                      <td className="py-3 pr-3 text-right font-semibold tabular-nums">
                        {emp.recibo ? (
                          <div>
                            <p>{money(emp.recibo.total)}</p>
                            {emp.recibo.descuentoPrestamos > 0 && (
                              <p className="text-xs font-normal text-muted-foreground">
                                −{money(emp.recibo.descuentoPrestamos)} prést.
                              </p>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {emp.recibo ? (
                          <Badge variant={emp.recibo.estado === "pagado" ? "secondary" : "outline"}>
                            {emp.recibo.estado === "pagado" ? "Pagado" : "Borrador"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin recibo</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button type="button" size="sm" variant="ghost" onClick={() => openConfig(emp)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            title="Préstamos"
                            onClick={() => openPrestamos(emp)}
                          >
                            <HandCoins className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openRecibo(emp)}
                            disabled={!emp.config}
                          >
                            {emp.recibo ? "Editar" : <Plus className="h-3.5 w-3.5" />}
                          </Button>
                          {emp.recibo?.estado === "borrador" && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => void markPaid(emp)}
                              disabled={saving}
                            >
                              <Banknote className="h-3.5 w-3.5 mr-1" />
                              Pagar
                            </Button>
                          )}
                          {emp.recibo && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => void removeRecibo(emp)}
                              disabled={saving}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-center text-muted-foreground py-8">No se pudo cargar la nómina</p>
      )}

      <Dialog open={configTarget !== null} onOpenChange={(o) => !o && setConfigTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salario · {configTarget?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Puesto (opcional)</Label>
              <Input
                value={configForm.puesto}
                onChange={(e) => setConfigForm((f) => ({ ...f, puesto: e.target.value }))}
                placeholder="Mesero, barra..."
              />
            </div>
            <div className="space-y-2">
              <Label>Salario base del periodo ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={configForm.salarioBase}
                onChange={(e) => setConfigForm((f) => ({ ...f, salarioBase: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Monto de referencia según tipo de pago (ej. quincenal = 15 días).
              </p>
            </div>
            <div className="space-y-2">
              <Label>Tipo de pago</Label>
              <Select
                value={configForm.tipoPago}
                onValueChange={(v) => setConfigForm((f) => ({ ...f, tipoPago: v as TipoPago }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIPO_PAGO_LABEL) as TipoPago[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPO_PAGO_LABEL[t]} ({DIAS_REF_TIPO[t]} días ref.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tarifa hora extra ($)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Auto si vacío"
                value={configForm.tarifaHoraExtra}
                onChange={(e) => setConfigForm((f) => ({ ...f, tarifaHoraExtra: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveConfig()} disabled={saving}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reciboTarget !== null} onOpenChange={(o) => !o && setReciboTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Recibo · {reciboTarget?.nombre} · {periodo?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Días trabajados</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.5"
                  value={reciboForm.diasTrabajados}
                  onChange={(e) => setReciboForm((f) => ({ ...f, diasTrabajados: e.target.value }))}
                />
                {reciboTarget?.config && (
                  <p className="text-xs text-muted-foreground">Ref. {diasRef} días</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Horas extra</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.5"
                  value={reciboForm.horasExtra}
                  onChange={(e) => setReciboForm((f) => ({ ...f, horasExtra: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Bonos ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={reciboForm.bonos}
                  onChange={(e) => setReciboForm((f) => ({ ...f, bonos: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Deducciones ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={reciboForm.deducciones}
                  onChange={(e) => setReciboForm((f) => ({ ...f, deducciones: e.target.value }))}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Descuento por préstamos ($)</Label>
                  <div className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={reciboForm.aplicarPrestamosAuto}
                      onCheckedChange={(v) =>
                        setReciboForm((f) => ({
                          ...f,
                          aplicarPrestamosAuto: v,
                          descuentoPrestamos:
                            v && reciboTarget
                              ? String(reciboTarget.descuentoPrestamosSugerido)
                              : f.descuentoPrestamos,
                        }))
                      }
                    />
                    <span className="text-muted-foreground">Cuota automática</span>
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={reciboForm.descuentoPrestamos}
                  onChange={(e) =>
                    setReciboForm((f) => ({
                      ...f,
                      descuentoPrestamos: e.target.value,
                      aplicarPrestamosAuto: false,
                    }))
                  }
                />
                {reciboTarget && saldoPrestamos(reciboTarget) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Saldo pendiente {money(saldoPrestamos(reciboTarget))}
                    {reciboTarget.descuentoPrestamosSugerido > 0 &&
                      ` · sugerido este periodo: ${money(reciboTarget.descuentoPrestamosSugerido)}`}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                value={reciboForm.notas}
                onChange={(e) => setReciboForm((f) => ({ ...f, notas: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReciboTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveRecibo()} disabled={saving}>
              {reciboTarget?.recibo ? "Actualizar" : "Generar recibo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={prestamoTarget !== null}
        onOpenChange={(o) => {
          if (!o) setPrestamoTarget(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Préstamos · {prestamoTarget?.nombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[50vh] overflow-y-auto">
            {(prestamoTarget?.prestamos ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin préstamos registrados.</p>
            ) : (
              <ul className="space-y-2">
                {(prestamoTarget?.prestamos ?? []).map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-md border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{p.concepto}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total {money(p.montoTotal)} · Saldo {money(p.saldoPendiente)} · Cuota{" "}
                        {money(p.cuotaPeriodo)}
                      </p>
                      {!p.activo && (
                        <Badge variant="outline" className="mt-1">
                          Pausado
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {p.saldoPendiente > 0 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() => void togglePrestamoActivo(p, !p.activo)}
                        >
                          {p.activo ? "Pausar" : "Activar"}
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={saving}
                        onClick={() => void removePrestamo(p)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t pt-3 space-y-3">
              <p className="text-sm font-medium">Nuevo préstamo</p>
              <div className="space-y-2">
                <Label>Concepto</Label>
                <Input
                  value={prestamoForm.concepto}
                  onChange={(e) => setPrestamoForm((f) => ({ ...f, concepto: e.target.value }))}
                  placeholder="Anticipo, adelanto..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Monto total ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={prestamoForm.montoTotal}
                    onChange={(e) => setPrestamoForm((f) => ({ ...f, montoTotal: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cuota por periodo ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={prestamoForm.cuotaPeriodo}
                    onChange={(e) => setPrestamoForm((f) => ({ ...f, cuotaPeriodo: e.target.value }))}
                  />
                </div>
              </div>
              <Button type="button" size="sm" onClick={() => void addPrestamo()} disabled={saving}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Registrar préstamo
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrestamoTarget(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
