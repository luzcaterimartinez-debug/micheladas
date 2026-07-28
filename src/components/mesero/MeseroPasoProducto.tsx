import { ArrowLeft, Check, Pencil } from "lucide-react";

import { QuantityStepper } from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import {
  MeseroStepHeader,
  ThemedPanel,
  ThemedPanelHeader,
} from "@/components/michelandia/michelandia-ui";
import { formatMenuPrice, productBaseLabel } from "@/lib/michelandia-theme";
import type { MenuCategoria } from "@/lib/menu-utils";
import type { MicheladaType } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

const TOUCH = "touch-manipulation active:scale-[0.98] transition-all duration-150";

export type ProductPick = { id: string; quantity: number };

type Props = {
  categoria?: MenuCategoria;
  picks: ProductPick[];
  onToggleProduct: (product: MicheladaType) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onCambiarCategoria: () => void;
  onIrCategorias?: () => void;
};

export function MeseroPasoProducto({
  categoria,
  picks,
  onToggleProduct,
  onQuantityChange,
  onCambiarCategoria,
  onIrCategorias,
}: Props) {
  if (!categoria) {
    return (
      <div className="space-y-4 text-center py-8">
        <p className="text-sm text-white/90 font-medium">Elige una categoría para ver productos.</p>
        {onIrCategorias && (
          <Button
            type="button"
            variant="secondary"
            className={cn(TOUCH, "rounded-full bg-white/90")}
            onClick={onIrCategorias}
          >
            Ir a categorías
          </Button>
        )}
      </div>
    );
  }

  const productos = categoria.productos;
  const themeId = categoria.id;
  const pickMap = new Map(picks.map((p) => [p.id, p.quantity]));
  const selectedCount = picks.reduce((s, p) => s + p.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <MeseroStepHeader
          stepLabel="Productos"
          title="Elige productos"
          description={`Marca uno o varios de ${categoria.name}. Ajusta la cantidad y continúa.`}
        />
        <button
          type="button"
          onClick={onCambiarCategoria}
          className={cn(
            TOUCH,
            "shrink-0 inline-flex items-center gap-1 text-xs font-bold text-white bg-black/20 hover:bg-black/30 rounded-full px-3 py-2 mt-1",
          )}
        >
          <Pencil className="h-3 w-3" />
          Cambiar
        </button>
      </div>

      {selectedCount > 0 && (
        <p className="text-xs font-bold text-white/90 bg-black/20 rounded-full px-3 py-1.5 inline-flex">
          {selectedCount} seleccionado{selectedCount === 1 ? "" : "s"}
        </p>
      )}

      {productos.length === 0 ? (
        <p className="text-sm text-white/90 text-center py-10 font-medium">
          No hay productos en esta categoría.
        </p>
      ) : (
        <ThemedPanel themeId={themeId}>
          <ThemedPanelHeader
            themeId={themeId}
            title={categoria.name}
            subtitle={categoria.description}
          />
          <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-2">
            {productos.map((p) => {
              const qty = pickMap.get(p.id) ?? 0;
              const selected = qty > 0;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-xl px-3 py-3 transition-colors",
                    selected
                      ? "bg-slate-900/5 ring-2 ring-slate-900/15"
                      : "hover:bg-slate-50",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onToggleProduct(p)}
                    className={cn(
                      TOUCH,
                      "w-full flex items-end gap-2 text-[15px] leading-snug text-left",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 mb-0.5",
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-300 bg-white",
                      )}
                      aria-hidden
                    >
                      {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="font-semibold text-slate-800 flex-1 min-w-0">
                      {productBaseLabel(p.name, categoria.name)}
                    </span>
                    <span
                      className="flex-1 border-b-2 border-dotted border-slate-400/70 mb-1 min-w-[1rem] max-w-[3rem]"
                      aria-hidden
                    />
                    <span className="font-extrabold text-slate-900 tabular-nums shrink-0">
                      {formatMenuPrice(p.price)}
                    </span>
                  </button>
                  {selected && (
                    <div className="mt-3 pl-8" onClick={(e) => e.stopPropagation()}>
                      <QuantityStepper
                        size="sm"
                        value={qty}
                        min={1}
                        onChange={(quantity) => onQuantityChange(p.id, quantity)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ThemedPanel>
      )}

      <button
        type="button"
        onClick={onCambiarCategoria}
        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-black/20 hover:bg-black/30 rounded-full px-4 py-2 touch-manipulation"
      >
        <ArrowLeft className="h-4 w-4" />
        Ver todos los sabores
      </button>
    </div>
  );
}
