import { useState } from "react";
import { AlertTriangle, Boxes, Loader2, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/lib/micheladas-store";
import { getStoredSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function InventoryPanel() {
  const { items, loading, error, reload, setStock, reset, removeItem } = useInventory();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ key: string; name: string } | null>(null);
  const isAdmin = getStoredSession()?.user.rol === "admin";

  async function handleStockChange(key: string, value: number) {
    setSavingKey(key);
    try {
      await setStock(key, value);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSavingKey(null);
    }
  }

  async function handleReset() {
    if (!confirm("¿Restaurar todo el inventario a los valores iniciales?")) return;
    setResetting(true);
    try {
      await reset();
      toast.success("Inventario restaurado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo reiniciar");
    } finally {
      setResetting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeItem(deleteTarget.key);
      toast.success(`"${deleteTarget.name}" eliminado del inventario`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Cargando inventario…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden md:flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Inventario</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stock de insumos y descuentos por comanda
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-3 sm:p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getStoredSession()
            ? "Sincronizado con la base de datos. Se descuenta al enviar cada comanda a barra."
            : "Modo local: los cambios se guardan en este navegador."}
        </p>
        <div
          className={cn(
            "grid gap-2 sm:flex sm:justify-end sm:shrink-0",
            isAdmin ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          <Button
            variant="outline"
            className="min-h-11 touch-manipulation gap-2"
            onClick={() => void reload()}
          >
            <RefreshCw className="h-4 w-4 shrink-0" />
            Actualizar
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              className="min-h-11 touch-manipulation gap-2"
              onClick={() => void handleReset()}
              disabled={resetting}
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 shrink-0" />
              )}
              Reiniciar
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12 rounded-xl border border-dashed">
          Sin ítems en inventario
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => {
            const min = i.minStock ?? 5;
            const low = i.stock <= min;
            return (
              <Card key={i.key} className={low ? "border-destructive/50 bg-destructive/[0.02]" : ""}>
                <CardHeader className="pb-2 px-4 pt-4 sm:px-6">
                  <CardTitle className="text-base flex items-start justify-between gap-2">
                    <span className="leading-snug">{i.name}</span>
                    {low && (
                      <Badge variant="destructive" className="gap-1 shrink-0 text-[10px]">
                        <AlertTriangle className="h-3 w-3" />
                        Bajo
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{i.key}</p>
                  <p className="text-xs text-muted-foreground">Mínimo: {min} {i.unit}</p>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      value={i.stock}
                      disabled={!isAdmin || savingKey === i.key}
                      onChange={(e) =>
                        void handleStockChange(i.key, Math.max(0, Number(e.target.value) || 0))
                      }
                      className="flex-1 min-w-0 h-11 text-base sm:text-sm sm:max-w-[7rem]"
                    />
                    <span className="text-sm font-medium text-muted-foreground shrink-0 w-8">
                      {i.unit}
                    </span>
                    {savingKey === i.key && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                    )}
                  </div>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full min-h-11 gap-2 touch-manipulation text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deleting}
                      onClick={() => setDeleteTarget({ key: i.key, name: i.name })}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ítem de inventario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se quitará <strong>{deleteTarget?.name}</strong> ({deleteTarget?.key}). Se borrará su
              consumo en productos y se limpiará la clave en adiciones que la usen. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
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
