import { useCallback, useEffect, useState } from "react";
import { Layers, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CantidadInventarioField } from "@/components/admin/CantidadInventarioField";
import { fetchInventario } from "@/lib/inventory-api";
import {
  findInventarioItem,
  formatCantidadInventario,
  inventarioSelectLabel,
  parseCantidadInventario,
} from "@/lib/inventario-cantidad";
import type { InventoryItem } from "@/lib/micheladas-store";
import {
  createFase,
  createFaseOpcion,
  deleteFaseOpcion,
  fetchFasesAdmin,
  updateFase,
  updateFaseOpcion,
} from "@/lib/menu-api";
import type { Fase } from "@/lib/fases";

export function AdminFases() {
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [faseDialog, setFaseDialog] = useState<"create" | "edit" | null>(null);
  const [editFaseId, setEditFaseId] = useState<string | null>(null);
  const [faseForm, setFaseForm] = useState({ nombre: "", descripcion: "", activo: true });

  const [opcionDialog, setOpcionDialog] = useState<{ faseId: string; mode: "create" | "edit" } | null>(
    null,
  );
  const [editOpcionId, setEditOpcionId] = useState<string | null>(null);
  const [opcionNombre, setOpcionNombre] = useState("");
  const [opcionStockKey, setOpcionStockKey] = useState("");
  const [opcionCantidad, setOpcionCantidad] = useState("");
  const [inventarioKeys, setInventarioKeys] = useState<InventoryItem[]>([]);
  const [deleteOpcion, setDeleteOpcion] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFases(await fetchFasesAdmin());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar fases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    fetchInventario()
      .then(setInventarioKeys)
      .catch(() => setInventarioKeys([]));
  }, []);

  function openCreateFase() {
    setFaseDialog("create");
    setEditFaseId(null);
    setFaseForm({ nombre: "", descripcion: "", activo: true });
  }

  function openEditFase(f: Fase) {
    setFaseDialog("edit");
    setEditFaseId(f.id);
    setFaseForm({
      nombre: f.name,
      descripcion: f.description ?? "",
      activo: f.activo !== false,
    });
  }

  async function saveFase() {
    if (!faseForm.nombre.trim()) {
      toast.error("Nombre de fase requerido");
      return;
    }
    setSaving(true);
    try {
      if (faseDialog === "create") {
        await createFase({
          nombre: faseForm.nombre.trim(),
          descripcion: faseForm.descripcion.trim(),
          activo: faseForm.activo,
        });
        toast.success("Fase creada");
      } else if (editFaseId) {
        await updateFase(editFaseId, {
          nombre: faseForm.nombre.trim(),
          descripcion: faseForm.descripcion.trim(),
          activo: faseForm.activo,
        });
        toast.success("Fase actualizada");
      }
      setFaseDialog(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function openCreateOpcion(faseId: string) {
    setOpcionDialog({ faseId, mode: "create" });
    setEditOpcionId(null);
    setOpcionNombre("");
    setOpcionStockKey("");
    setOpcionCantidad("");
  }

  function openEditOpcion(faseId: string, op: Fase["opciones"][number]) {
    setOpcionDialog({ faseId, mode: "edit" });
    setEditOpcionId(op.id);
    setOpcionNombre(op.name);
    setOpcionStockKey(op.stockKey ?? "");
    setOpcionCantidad(String(op.cantidad ?? 1));
  }

  async function confirmDeleteOpcion() {
    if (!deleteOpcion) return;
    setSaving(true);
    try {
      await deleteFaseOpcion(deleteOpcion.id);
      toast.success(`"${deleteOpcion.name}" eliminada`);
      if (editOpcionId === deleteOpcion.id) {
        setOpcionDialog(null);
        setEditOpcionId(null);
      }
      setDeleteOpcion(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  async function saveOpcion() {
    if (!opcionDialog || !opcionNombre.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    const stockKey = opcionStockKey.trim() || undefined;
    const parsedQty = parseCantidadInventario(stockKey, opcionCantidad);
    if (!parsedQty.ok) {
      toast.error(parsedQty.message);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: opcionNombre.trim(),
        inventario_clave: stockKey,
        cantidad: parsedQty.cantidad,
      };
      if (opcionDialog.mode === "create") {
        await createFaseOpcion(opcionDialog.faseId, payload);
        toast.success("Opción agregada");
      } else if (editOpcionId) {
        await updateFaseOpcion(editOpcionId, payload);
        toast.success("Opción actualizada");
      }
      setOpcionDialog(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          Fases del pedido
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define etapas como Topping, Néctar, etc. En cada opción escribe cuánto lleva (ej. 50 g de
          tajín, 0.05 L de chamoy); al vender se resta del inventario.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Fases</CardTitle>
            <CardDescription>Ej. Topping, Néctar, Escarcha</CardDescription>
          </div>
          <Button onClick={openCreateFase} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nueva fase
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {fases.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Crea la primera fase (por ejemplo &quot;Topping&quot;).
            </p>
          ) : (
            fases.map((fase) => (
              <div key={fase.id} className="rounded-xl border p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{fase.name}</p>
                    {fase.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{fase.description}</p>
                    )}
                    {fase.activo === false && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Oculta
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditFase(fase)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Editar fase
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => openCreateOpcion(fase.id)}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Opción
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fase.opciones.length === 0 ? (
                    <span className="text-xs text-muted-foreground">Sin opciones</span>
                  ) : (
                    fase.opciones.map((op) => (
                      <span
                        key={op.id}
                        className="inline-flex items-center rounded-full border text-sm overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => openEditOpcion(fase.id, op)}
                          className="inline-flex items-center gap-1 px-3 py-1 hover:bg-muted"
                        >
                          {op.name}
                          {op.stockKey && (
                            <span className="text-[10px] opacity-60 ml-0.5">
                              ·
                              {formatCantidadInventario(
                                op.cantidad ?? 1,
                                findInventarioItem(inventarioKeys, op.stockKey)?.unit ?? "",
                              )}
                            </span>
                          )}
                          <Pencil className="h-3 w-3 opacity-50" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteOpcion({ id: op.id, name: op.name })}
                          className="px-2 py-1 border-l hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Eliminar ${op.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={faseDialog !== null} onOpenChange={(o) => !o && setFaseDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{faseDialog === "create" ? "Nueva fase" : "Editar fase"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={faseForm.nombre}
                onChange={(e) => setFaseForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej. Topping, Néctar"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={faseForm.descripcion}
                onChange={(e) => setFaseForm((f) => ({ ...f, descripcion: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between border rounded-lg p-3">
              <Label>Activa</Label>
              <Switch
                checked={faseForm.activo}
                onCheckedChange={(activo) => setFaseForm((f) => ({ ...f, activo }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFaseDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveFase()} disabled={saving}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={opcionDialog !== null} onOpenChange={(o) => !o && setOpcionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {opcionDialog?.mode === "create" ? "Nueva opción" : "Editar opción"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={opcionNombre} onChange={(e) => setOpcionNombre(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Inventario (clave)</Label>
              <Select
                value={opcionStockKey || "__none__"}
                onValueChange={(v) => setOpcionStockKey(v === "__none__" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin descuento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin vínculo</SelectItem>
                  {inventarioKeys.map((i) => (
                    <SelectItem key={i.key} value={i.key}>
                      {inventarioSelectLabel(i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CantidadInventarioField
              inventario={inventarioKeys}
              stockKey={opcionStockKey}
              value={opcionCantidad}
              onChange={setOpcionCantidad}
            />
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            {opcionDialog?.mode === "edit" && editOpcionId && (
              <Button
                type="button"
                variant="destructive"
                className="sm:mr-auto"
                disabled={saving}
                onClick={() => {
                  const name = opcionNombre.trim() || "esta opción";
                  setDeleteOpcion({ id: editOpcionId, name });
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <Button variant="outline" onClick={() => setOpcionDialog(null)}>
                Cancelar
              </Button>
              <Button onClick={() => void saveOpcion()} disabled={saving}>
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteOpcion !== null}
        onOpenChange={(open) => !open && setDeleteOpcion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar opción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará <strong>{deleteOpcion?.name}</strong> de esta fase y de los productos que
              la tengan asignada. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                void confirmDeleteOpcion();
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
