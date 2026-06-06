import { useCallback, useEffect, useState } from "react";
import { LayoutGrid, Loader2, Pencil, Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createCategoria, fetchMenuAdmin, updateCategoria } from "@/lib/menu-api";
import type { MenuCategoria } from "@/lib/menu-utils";

export function AdminCategorias() {
  const [categorias, setCategorias] = useState<MenuCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", activo: true });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const menu = await fetchMenuAdmin();
      setCategorias(menu.categorias);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setDialog("create");
    setEditId(null);
    setForm({ nombre: "", descripcion: "", activo: true });
  }

  function openEdit(c: MenuCategoria) {
    setDialog("edit");
    setEditId(c.id);
    setForm({
      nombre: c.name,
      descripcion: c.description ?? "",
      activo: c.activo !== false,
    });
  }

  async function save() {
    if (!form.nombre.trim()) {
      toast.error("Nombre de categoría requerido");
      return;
    }
    setSaving(true);
    try {
      if (dialog === "create") {
        await createCategoria({
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          activo: form.activo,
        });
        toast.success("Categoría creada");
      } else if (editId) {
        await updateCategoria(editId, {
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim(),
          activo: form.activo,
        });
        toast.success("Categoría actualizada");
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
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          Categorías del menú
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Organiza el menú en secciones. Los productos se asignan a una categoría desde el apartado
          Menú.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base">Listado</CardTitle>
            <CardDescription>
              {categorias.length} categoría{categorias.length === 1 ? "" : "s"} en total
            </CardDescription>
          </div>
          <Button onClick={openCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nueva categoría
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full py-8 text-center">
              No hay categorías. Crea la primera para empezar a agregar productos.
            </p>
          ) : (
            categorias.map((c) => (
              <div key={c.id} className="rounded-xl border p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                    {!c.activo && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Oculta
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {c.description || "Sin descripción"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {c.productos.length} prod.
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit gap-1"
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "create" ? "Nueva categoría" : "Editar categoría"}</DialogTitle>
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
              <Label>Descripción</Label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between border rounded-lg p-3">
              <Label>Visible en menú</Label>
              <Switch
                checked={form.activo}
                onCheckedChange={(activo) => setForm((f) => ({ ...f, activo }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
