import { useCallback, useEffect, useState } from "react";
import { ListPlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
  createAdicion,
  deleteAdicion,
  fetchMenuAdmin,
  updateAdicion,
} from "@/lib/menu-api";
import type { Addition } from "@/lib/micheladas-store";

type AdicionAdmin = Addition & { activo?: boolean };

export function AdminAdiciones() {
  const [adiciones, setAdiciones] = useState<AdicionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    stock_key: "",
    cantidad: "",
    activo: true,
  });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [inventarioKeys, setInventarioKeys] = useState<InventoryItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const menu = await fetchMenuAdmin();
      setAdiciones(menu.adiciones);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar adiciones");
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

  function openCreate() {
    setDialog("create");
    setEditId(null);
    setForm({ nombre: "", precio: "", stock_key: "", cantidad: "", activo: true });
  }

  function openEdit(a: AdicionAdmin) {
    setDialog("edit");
    setEditId(a.id);
    setForm({
      nombre: a.name,
      precio: String(a.price),
      stock_key: a.stockKey ?? "",
      cantidad: String(a.cantidad ?? 1),
      activo: a.activo !== false,
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteAdicion(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" eliminada`);
      if (editId === deleteTarget.id) {
        setDialog(null);
        setEditId(null);
      }
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    if (!form.nombre.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    const stockKey = form.stock_key.trim() || undefined;
    const parsedQty = parseCantidadInventario(stockKey, form.cantidad);
    if (!parsedQty.ok) {
      toast.error(parsedQty.message);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        stock_key: stockKey,
        cantidad: parsedQty.cantidad,
        activo: form.activo,
      };
      if (dialog === "create") {
        await createAdicion(payload);
        toast.success("Adición creada");
      } else if (editId) {
        await updateAdicion(editId, payload);
        toast.success("Adición actualizada");
      }
      setDialog(null);
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
          <ListPlus className="h-5 w-5 text-muted-foreground" />
          Adiciones globales
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Extras que el mesero puede agregar a cualquier producto (paso &quot;Adiciones&quot; del
          pedido). Indica el ítem de inventario y cuánto lleva (misma unidad: g, L, pz); al
          vender se resta esa cantidad del stock.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Listado</CardTitle>
            <CardDescription>
              {adiciones.length} adición{adiciones.length === 1 ? "" : "es"} disponibles
            </CardDescription>
          </div>
          <Button onClick={openCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nueva adición
          </Button>
        </CardHeader>
        <CardContent>
          {adiciones.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No hay adiciones. Crea la primera para ofrecer extras en el pedido.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {adiciones.map((a) => (
                <div key={a.id} className="rounded-xl border p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{a.name}</p>
                      {!a.activo && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Oculta
                        </Badge>
                      )}
                      {a.stockKey && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Descuenta{" "}
                          {formatCantidadInventario(
                            a.cantidad ?? 1,
                            findInventarioItem(inventarioKeys, a.stockKey)?.unit ?? "",
                          )}{" "}
                          de {a.stockKey}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                      +${a.price}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => openEdit(a)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget({ id: a.id, name: a.name })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "create" ? "Nueva adición" : "Editar adición"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio ($)</Label>
              <Input
                type="number"
                min={0}
                value={form.precio}
                onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Inventario (clave)</Label>
              <Select
                value={form.stock_key || "__none__"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, stock_key: v === "__none__" ? "" : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin descuento de stock" />
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
              stockKey={form.stock_key}
              value={form.cantidad}
              onChange={(cantidad) => setForm((f) => ({ ...f, cantidad }))}
            />
            <div className="flex items-center justify-between border rounded-lg p-3">
              <Label>Visible en menú</Label>
              <Switch
                checked={form.activo}
                onCheckedChange={(activo) => setForm((f) => ({ ...f, activo }))}
              />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2">
            {dialog === "edit" && editId && (
              <Button
                type="button"
                variant="destructive"
                className="sm:mr-auto"
                disabled={saving}
                onClick={() =>
                  setDeleteTarget({
                    id: editId,
                    name: form.nombre.trim() || adiciones.find((a) => a.id === editId)?.name || "",
                  })
                }
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <Button variant="outline" onClick={() => setDialog(null)}>
                Cancelar
              </Button>
              <Button onClick={() => void save()} disabled={saving}>
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar adición?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará <strong>{deleteTarget?.name}</strong> del menú. Las comandas ya enviadas
              conservan el historial con ese nombre. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
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
