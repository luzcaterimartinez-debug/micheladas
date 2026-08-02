import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, Trash2, Wallet } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { localDateIso, formatAppMoney } from "@/lib/local-date";
import {
  CATEGORIA_GASTO_LABEL,
  CATEGORIAS_GASTO,
  createGastoApi,
  deleteGastoApi,
  fetchGastos,
  fetchGastosResumen,
  updateGastoApi,
  type CategoriaGasto,
  type Gasto,
  type GastosResumen,
} from "@/lib/gastos-api";

function money(n: number) {
  return formatAppMoney(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthStartIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

type FormState = {
  concepto: string;
  monto: string;
  categoria: CategoriaGasto;
  fecha: string;
  notas: string;
};

const emptyForm = (): FormState => ({
  concepto: "",
  monto: "",
  categoria: "otros",
  fecha: localDateIso(),
  notas: "",
});

export function AdminGastos() {
  const [desde, setDesde] = useState(monthStartIso());
  const [hasta, setHasta] = useState(localDateIso());
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaGasto | "todas">("todas");
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [resumen, setResumen] = useState<GastosResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [list, r] = await Promise.all([
        fetchGastos({
          desde,
          hasta,
          categoria: categoriaFiltro === "todas" ? undefined : categoriaFiltro,
        }),
        fetchGastosResumen({ desde, hasta }),
      ]);
      setGastos(list);
      setResumen(r);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar gastos");
    } finally {
      setLoading(false);
    }
  }, [desde, hasta, categoriaFiltro]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(g: Gasto) {
    setEditing(g);
    setForm({
      concepto: g.concepto,
      monto: String(g.monto),
      categoria: g.categoria,
      fecha: g.fecha,
      notas: g.notas ?? "",
    });
    setDialogOpen(true);
  }

  async function saveGasto() {
    const concepto = form.concepto.trim();
    const monto = Number(form.monto);
    if (!concepto) {
      toast.error("Escribe el concepto");
      return;
    }
    if (!(monto > 0)) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        concepto,
        monto,
        categoria: form.categoria,
        fecha: form.fecha,
        notas: form.notas.trim() || undefined,
      };
      if (editing) {
        await updateGastoApi(editing.id, payload);
        toast.success("Gasto actualizado");
      } else {
        await createGastoApi(payload);
        toast.success("Gasto registrado");
      }
      setDialogOpen(false);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function removeGasto(g: Gasto) {
    if (!window.confirm(`¿Eliminar gasto "${g.concepto}" (${money(g.monto)})?`)) return;
    try {
      await deleteGastoApi(g.id);
      toast.success("Gasto eliminado");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Gastos</h2>
          <p className="text-sm text-muted-foreground">
            Registra egresos del negocio (insumos, servicios, renta, etc.).
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void reload()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nuevo gasto
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="gastos-desde">Desde</Label>
          <Input id="gastos-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="gastos-hasta">Hasta</Label>
          <Input id="gastos-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Categoría</Label>
          <Select
            value={categoriaFiltro}
            onValueChange={(v) => setCategoriaFiltro(v as CategoriaGasto | "todas")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {CATEGORIAS_GASTO.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORIA_GASTO_LABEL[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total del periodo</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{money(resumen?.total ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Movimientos</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{resumen?.cantidad ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              Categorías con gasto
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{resumen?.porCategoria.length ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {resumen && resumen.porCategoria.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Por categoría</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {resumen.porCategoria.map((c) => (
              <Badge key={c.categoria} variant="secondary" className="gap-1.5 tabular-nums">
                {CATEGORIA_GASTO_LABEL[c.categoria]} · {money(c.total)} ({c.cantidad})
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Listado</CardTitle>
          <CardDescription>
            {desde === hasta ? `Gastos del ${desde}` : `Del ${desde} al ${hasta}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : gastos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              No hay gastos en este periodo.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {gastos.map((g) => (
                <li key={g.id} className="py-3.5 flex gap-3 items-start justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium leading-snug">{g.concepto}</p>
                      <Badge variant="outline">{CATEGORIA_GASTO_LABEL[g.categoria]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {g.fecha}
                      {g.creadoPorNombre ? ` · ${g.creadoPorNombre}` : ""}
                    </p>
                    {g.notas && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{g.notas}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="font-semibold tabular-nums mr-1">{money(g.monto)}</span>
                    <Button type="button" size="icon" variant="ghost" onClick={() => openEdit(g)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" onClick={() => void removeGasto(g)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar gasto" : "Nuevo gasto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="gasto-concepto">Concepto</Label>
              <Input
                id="gasto-concepto"
                value={form.concepto}
                onChange={(e) => setForm((f) => ({ ...f, concepto: e.target.value }))}
                placeholder="Ej. Refresco, luz, gas…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="gasto-monto">Monto</Label>
                <Input
                  id="gasto-monto"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.monto}
                  onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gasto-fecha">Fecha</Label>
                <Input
                  id="gasto-fecha"
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => setForm((f) => ({ ...f, categoria: v as CategoriaGasto }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_GASTO.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORIA_GASTO_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gasto-notas">Notas (opcional)</Label>
              <Textarea
                id="gasto-notas"
                rows={2}
                value={form.notas}
                onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void saveGasto()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? "Guardar" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
