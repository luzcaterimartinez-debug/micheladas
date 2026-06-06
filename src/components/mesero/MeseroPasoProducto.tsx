import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  MenuPriceRow,
  MeseroStepHeader,
  ThemedPanel,
  ThemedPanelHeader,
} from "@/components/michelandia/michelandia-ui";
import { productBaseLabel } from "@/lib/michelandia-theme";
import type { MenuCategoria } from "@/lib/menu-utils";
import type { MicheladaType } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

const TOUCH = "touch-manipulation active:scale-[0.98] transition-all duration-150";

type Props = {
  categoria?: MenuCategoria;
  selectedProductId: string;
  onSelectProduct: (product: MicheladaType) => void;
  onCambiarCategoria: () => void;
  onIrCategorias?: () => void;
};

export function MeseroPasoProducto({
  categoria,
  selectedProductId,
  onSelectProduct,
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

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <MeseroStepHeader
          stepLabel="Paso 4"
          title="Elige la base"
          description={`Productos de ${categoria.name}. Toca uno para continuar.`}
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
          <div className="px-3 py-3 sm:px-4 sm:py-4 space-y-1">
            {productos.map((p) => (
              <MenuPriceRow
                key={p.id}
                label={productBaseLabel(p.name, categoria.name)}
                price={p.price}
                selected={selectedProductId === p.id}
                onClick={() => onSelectProduct(p)}
              />
            ))}
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
