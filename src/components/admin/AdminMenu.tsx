import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, LayoutGrid, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  createProducto,
  fetchMenuAdmin,
  updateProducto,
} from "@/lib/menu-api";
import { fetchInventario } from "@/lib/inventory-api";
import {
  cantidadPlaceholder,
  findInventarioItem,
  inventarioSelectLabel,
} from "@/lib/inventario-cantidad";
import {
  PASO_NOTAS,
  fasePasoId,
  isFasePaso,
  normalizeProductPasos,
  parseFaseIdFromPaso,
  type ConsumoLine,
  type Fase,
} from "@/lib/fases";
import type { InventoryItem } from "@/lib/micheladas-store";
import type { MenuCategoria } from "@/lib/menu-utils";
import type { MicheladaType } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

type ProductoAdmin = MicheladaType & { activo?: boolean };
type ProductForm = {
  nombre: string;
  precio: string;
  descripcion: string;
  categoriaId: string;
  activo: boolean;
  pasos: string[];
  opcionIds: string[];
  consumo: ConsumoLine[];
};

function defaultPasos(fases: Fase[]): string[] {
  const ids = fases.filter((f) => f.activo !== false).map((f) => f.id);
  return normalizeProductPasos(undefined, ids.length ? ids : ["topping"]);
}

const emptyProductForm = (categoriaId = "", fases: Fase[] = []): ProductForm => ({
  nombre: "",
  precio: "",
  descripcion: "",
  categoriaId,
  activo: true,
  pasos: defaultPasos(fases),
  opcionIds: [],
  consumo: [],
});

export function AdminMenu() {
  const [categorias, setCategorias] = useState<MenuCategoria[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [productDialog, setProductDialog] = useState<"create" | "edit" | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState<ProductForm>(emptyProductForm);

  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string | null>(null);
  const [inventarioKeys, setInventarioKeys] = useState<InventoryItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const menu = await fetchMenuAdmin();
      setCategorias(menu.categorias);
      setFases(menu.fases);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar menú");
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

  function openCreateProduct(categoriaId?: string) {
    const catId = categoriaId ?? selectedCategoriaId ?? categorias[0]?.id ?? "";
    setProductDialog("create");
    setEditProductId(null);
    setProdForm(emptyProductForm(catId, fases));
  }

  function openEditProduct(p: ProductoAdmin) {
    const faseIds = fases.map((f) => f.id);
    setProductDialog("edit");
    setEditProductId(p.id);
    setProdForm({
      nombre: p.name,
      precio: String(p.price),
      descripcion: p.description,
      categoriaId: p.categoriaId ?? categorias[0]?.id ?? "",
      activo: p.activo !== false,
      pasos: normalizeProductPasos(p.pasos, faseIds),
      opcionIds: p.faseOpciones.map((o) => o.id),
      consumo: p.consumo?.length ? [...p.consumo] : [],
    });
  }

  function addConsumoLine() {
    setProdForm((f) => ({
      ...f,
      consumo: [...f.consumo, { clave: inventarioKeys[0]?.key ?? "", cantidad: 1 }],
    }));
  }

  function updateConsumoLine(index: number, patch: Partial<ConsumoLine>) {
    setProdForm((f) => ({
      ...f,
      consumo: f.consumo.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    }));
  }

  function removeConsumoLine(index: number) {
    setProdForm((f) => ({
      ...f,
      consumo: f.consumo.filter((_, i) => i !== index),
    }));
  }

  function toggleFasePaso(faseId: string) {
    const paso = fasePasoId(faseId);
    setProdForm((f) => ({
      ...f,
      pasos: f.pasos.includes(paso)
        ? f.pasos.filter((s) => s !== paso)
        : [...f.pasos, paso],
    }));
  }

  function toggleNotasPaso() {
    setProdForm((f) => ({
      ...f,
      pasos: f.pasos.includes(PASO_NOTAS)
        ? f.pasos.filter((s) => s !== PASO_NOTAS)
        : [...f.pasos, PASO_NOTAS],
    }));
  }

  function toggleOpcion(id: string) {
    setProdForm((f) => ({
      ...f,
      opcionIds: f.opcionIds.includes(id)
        ? f.opcionIds.filter((x) => x !== id)
        : [...f.opcionIds, id],
    }));
  }

  async function saveProduct() {
    if (!prodForm.nombre.trim() || !prodForm.precio) {
      toast.error("Nombre y precio son obligatorios");
      return;
    }
    if (!prodForm.pasos.some(isFasePaso) && !prodForm.pasos.includes(PASO_NOTAS)) {
      toast.error("Selecciona al menos una fase o notas");
      return;
    }
    if (!prodForm.categoriaId) {
      toast.error("Selecciona una categoría");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre: prodForm.nombre.trim(),
        precio: Number(prodForm.precio),
        descripcion: prodForm.descripcion.trim(),
        categoria_id: prodForm.categoriaId,
        pasos: prodForm.pasos,
        opcion_ids: prodForm.opcionIds,
        consumo: prodForm.consumo.filter((c) => c.clave.trim()),
        activo: prodForm.activo,
      };

      if (productDialog === "create") {
        await createProducto(payload);
        toast.success("Producto creado");
      } else if (editProductId) {
        await updateProducto(editProductId, payload);
        toast.success("Producto actualizado");
      }

      setProductDialog(null);
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

  const categoriaActiva = categorias.find((c) => c.id === selectedCategoriaId);
  const productosCategoria = categoriaActiva?.productos ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Productos</h2>
        <p className="text-sm text-muted-foreground">
          {selectedCategoriaId
            ? "Administra los productos de la categoría elegida."
            : "Elige una categoría para ver y editar sus productos."}
        </p>
      </div>

      {!selectedCategoriaId ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              Categorías
            </CardTitle>
            <CardDescription>
              Toca una categoría para ver sus productos. Para crear o editar categorías, usa el
              apartado Categorías.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categorias.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No hay categorías. Créalas en el apartado Categorías.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoriaId(cat.id)}
                    className={cn(
                      "w-full text-left rounded-2xl border bg-card px-4 py-4",
                      "flex items-center gap-3 min-h-[5rem]",
                      "hover:border-foreground/25 hover:bg-muted/30 transition-colors",
                      !cat.activo && "opacity-70",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] leading-tight tracking-tight">
                        {cat.name}
                      </p>
                      {cat.description ? (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {cat.description}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {cat.productos.length} producto{cat.productos.length === 1 ? "" : "s"}
                        </Badge>
                        {cat.activo === false && (
                          <Badge variant="outline" className="text-xs">
                            Oculta
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-2 gap-1 text-muted-foreground"
                onClick={() => setSelectedCategoriaId(null)}
              >
                <ArrowLeft className="h-4 w-4" />
                Todas las categorías
              </Button>
              <div>
                <CardTitle className="text-base">{categoriaActiva?.name}</CardTitle>
                <CardDescription>
                  {productosCategoria.length} producto
                  {productosCategoria.length === 1 ? "" : "s"} en esta categoría
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => openCreateProduct(selectedCategoriaId)}
              className="gap-2 shrink-0 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          </CardHeader>
          <CardContent>
            {productosCategoria.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Esta categoría no tiene productos. Agrega el primero con el botón de arriba.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {productosCategoria.map((p) => (
                  <div key={p.id} className="rounded-xl border p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold leading-tight">{p.name}</p>
                        {!p.activo && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Oculto
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        ${p.price}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fases:{" "}
                      {(p.pasos ?? [])
                        .filter(isFasePaso)
                        .map((paso) => {
                          const fid = parseFaseIdFromPaso(paso);
                          return fases.find((f) => f.id === fid)?.name ?? fid;
                        })
                        .join(", ") || "—"}{" "}
                      → adiciones
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit gap-1"
                      onClick={() => openEditProduct(p)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={productDialog !== null} onOpenChange={(o) => !o && setProductDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {productDialog === "create" ? "Nuevo producto" : "Editar producto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={prodForm.nombre}
                onChange={(e) => setProdForm((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Precio base ($)</Label>
              <Input
                type="number"
                min={1}
                value={prodForm.precio}
                onChange={(e) => setProdForm((f) => ({ ...f, precio: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={prodForm.descripcion}
                onChange={(e) => setProdForm((f) => ({ ...f, descripcion: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={prodForm.categoriaId}
                onValueChange={(v) => setProdForm((f) => ({ ...f, categoriaId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elige categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fases en el pedido (mesero)</Label>
              <p className="text-xs text-muted-foreground">
                Cada fase activa un paso aparte. Adiciones es global (apartado Adiciones).
              </p>
              <div className="space-y-2 rounded-lg border p-3">
                {fases.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Crea fases en el apartado Fases.
                  </p>
                ) : (
                  fases.map((fase) => (
                    <label key={fase.id} className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        checked={prodForm.pasos.includes(fasePasoId(fase.id))}
                        onCheckedChange={() => toggleFasePaso(fase.id)}
                      />
                      <span>
                        <span className="font-medium text-sm">{fase.name}</span>
                        {fase.description && (
                          <span className="block text-xs text-muted-foreground">
                            {fase.description}
                          </span>
                        )}
                      </span>
                    </label>
                  ))
                )}
                <label className="flex items-start gap-3 cursor-pointer pt-2 border-t">
                  <Checkbox
                    checked={prodForm.pasos.includes(PASO_NOTAS)}
                    onCheckedChange={toggleNotasPaso}
                  />
                  <span>
                    <span className="font-medium text-sm">Notas</span>
                    <span className="block text-xs text-muted-foreground">
                      Indicaciones para barra
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Consumo base (inventario)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addConsumoLine}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Línea
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cantidad fija que lleva cada venta (misma unidad que en Inventario: g, L, pz).
              </p>
              <div className="space-y-2 rounded-lg border p-3">
                {prodForm.consumo.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Vacío = reglas por defecto (cerveza + limón).
                  </p>
                ) : (
                  prodForm.consumo.map((line, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2 items-end">
                      <div className="flex-1 min-w-[8rem] space-y-1">
                        <Label className="text-xs">Clave</Label>
                        <Select
                          value={line.clave || "__none__"}
                          onValueChange={(v) =>
                            updateConsumoLine(idx, { clave: v === "__none__" ? "" : v })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {inventarioKeys.map((i) => (
                              <SelectItem key={i.key} value={i.key}>
                                {inventarioSelectLabel(i)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-28 space-y-1">
                        <Label className="text-xs">Cantidad</Label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0.001}
                            step="any"
                            className="h-9"
                            value={line.cantidad}
                            placeholder={cantidadPlaceholder(
                              findInventarioItem(inventarioKeys, line.clave)?.unit,
                            )}
                            onChange={(e) =>
                              updateConsumoLine(idx, {
                                cantidad: Number(e.target.value) || 1,
                              })
                            }
                          />
                          <span className="text-xs font-medium text-muted-foreground w-6 shrink-0">
                            {findInventarioItem(inventarioKeys, line.clave)?.unit ?? ""}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeConsumoLine(idx)}
                      >
                        Quitar
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Opciones por fase</Label>
              <div className="max-h-48 overflow-y-auto space-y-3 rounded-lg border p-3">
                {fases.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sin fases configuradas</p>
                ) : (
                  fases.map((fase) => (
                    <div key={fase.id}>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                        {fase.name}
                      </p>
                      <div className="space-y-1.5 pl-1">
                        {fase.opciones.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Sin opciones</p>
                        ) : (
                          fase.opciones.map((op) => (
                            <label key={op.id} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={prodForm.opcionIds.includes(op.id)}
                                onCheckedChange={() => toggleOpcion(op.id)}
                              />
                              <span className="text-sm">{op.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3">
              <Label>Visible en menú</Label>
              <Switch
                checked={prodForm.activo}
                onCheckedChange={(activo) => setProdForm((f) => ({ ...f, activo }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void saveProduct()} disabled={saving}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
