import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Plus, Trash2, Move, Clock, Package, Check } from "lucide-react";
import { useComandas, useMesas, type Mesa, type Comanda } from "@/lib/micheladas-store";

const ESTADO_META: Record<Mesa["estado"], { label: string; cls: string }> = {
  libre: { label: "Libre", cls: "bg-secondary text-secondary-foreground" },
  ocupada: { label: "Ocupada", cls: "bg-primary text-primary-foreground" },
  reservada: { label: "Reservada", cls: "bg-accent text-accent-foreground" },
};

const STATUS_ICON = { pendiente: Clock, lista: Package, entregada: Check } as const;

export function MesasPanel() {
  const { mesas, addMesa, updateMesa, removeMesa, resetMesas } = useMesas();
  const { comandas, reassignMesa, updateStatus } = useComandas();

  const [nombre, setNombre] = useState("");
  const [capacidad, setCapacidad] = useState(4);
  const [reassign, setReassign] = useState<Comanda | null>(null);
  const [reassignMesaId, setReassignMesaId] = useState<string>("");

  const activos = useMemo(
    () => comandas.filter((c) => c.status !== "entregada"),
    [comandas],
  );

  const comandasByMesa = useMemo(() => {
    const map = new Map<string, Comanda[]>();
    activos.forEach((c) => {
      const key = c.mesa || "__sin__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return map;
  }, [activos]);

  function handleAdd() {
    if (!nombre.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    addMesa(nombre.trim(), capacidad);
    setNombre("");
    setCapacidad(4);
    toast.success("Mesa agregada");
  }

  function openReassign(c: Comanda) {
    setReassign(c);
    setReassignMesaId(c.mesa || "__none__");
  }

  function confirmReassign() {
    if (!reassign) return;
    const mesaId = reassignMesaId === "__none__" ? undefined : reassignMesaId;
    const mesaNombre = mesaId ? mesas.find((m) => m.id === mesaId)?.nombre : undefined;
    reassignMesa(reassign.id, mesaNombre);
    if (mesaId) updateMesa(mesaId, { estado: "ocupada", cliente: reassign.cliente });
    toast.success(`Comanda #${reassign.folio} reasignada`);
    setReassign(null);
  }

  const sinAsignar = comandasByMesa.get("__sin__") || [];

  return (
    <div className="space-y-6">
      {/* Crear mesa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Agregar mesa
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <Label htmlFor="mesa-nombre">Nombre</Label>
            <Input
              id="mesa-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Mesa 6, Terraza 1..."
              maxLength={30}
            />
          </div>
          <div className="w-32">
            <Label htmlFor="mesa-cap">Capacidad</Label>
            <Input
              id="mesa-cap"
              type="number"
              min={0}
              max={20}
              value={capacidad}
              onChange={(e) => setCapacidad(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleAdd}>Agregar</Button>
          <Button variant="ghost" onClick={resetMesas} className="ml-auto">
            Restaurar mesas
          </Button>
        </CardContent>
      </Card>

      {/* Mesas */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" /> Mesas ({mesas.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mesas.map((m) => {
            const meta = ESTADO_META[m.estado];
            const pedidos = activos.filter((c) => c.mesa === m.nombre);
            const totalMesa = pedidos.reduce((s, c) => s + c.total, 0);
            return (
              <Card key={m.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{m.nombre}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Capacidad: {m.capacidad}
                        {m.cliente && ` · ${m.cliente}`}
                      </p>
                    </div>
                    <Badge className={meta.cls}>{meta.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select
                    value={m.estado}
                    onValueChange={(v) =>
                      updateMesa(m.id, {
                        estado: v as Mesa["estado"],
                        cliente: v === "libre" ? undefined : m.cliente,
                      })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="libre">Libre</SelectItem>
                      <SelectItem value="ocupada">Ocupada</SelectItem>
                      <SelectItem value="reservada">Reservada</SelectItem>
                    </SelectContent>
                  </Select>

                  {pedidos.length > 0 ? (
                    <>
                      <Separator />
                      <ul className="space-y-2">
                        {pedidos.map((c) => {
                          const Icon = STATUS_ICON[c.status];
                          return (
                            <li
                              key={c.id}
                              className="rounded-md border bg-muted/30 p-2 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium flex items-center gap-1">
                                  <Icon className="h-3 w-3" /> #{c.folio}
                                </span>
                                <span className="font-semibold">${c.total}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {c.items.length} bebida(s) · {c.cliente}
                              </p>
                              <div className="flex gap-1 mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => openReassign(c)}
                                >
                                  <Move className="h-3 w-3 mr-1" /> Mover
                                </Button>
                                {c.status === "pendiente" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => void updateStatus(c.id, "lista")}
                                  >
                                    Lista
                                  </Button>
                                )}
                                {c.status === "lista" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => void updateStatus(c.id, "entregada")}
                                  >
                                    Entregar
                                  </Button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total mesa</span>
                        <span>${totalMesa}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Sin pedidos activos
                    </p>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => removeMesa(m.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sin asignar */}
      {sinAsignar.length > 0 && (
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="text-base">
              Pedidos sin mesa asignada ({sinAsignar.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sinAsignar.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="text-sm">
                  <p className="font-medium">
                    #{c.folio} · {c.cliente}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.items.length} bebida(s) · ${c.total}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => openReassign(c)}>
                  <Move className="h-4 w-4 mr-1" /> Asignar mesa
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reassign dialog */}
      <Dialog open={!!reassign} onOpenChange={(o) => !o && setReassign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reasignar comanda #{reassign?.folio}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Mesa destino</Label>
            <Select value={reassignMesaId} onValueChange={setReassignMesaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una mesa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin mesa</SelectItem>
                {mesas.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nombre} · {ESTADO_META[m.estado].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReassign(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmReassign}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
