import { Check, MapPin, User } from "lucide-react";

import {
  FlavorGridCard,
  MeseroStepHeader,
} from "@/components/michelandia/michelandia-ui";
import type { MenuCategoria } from "@/lib/menu-utils";
import type { Mesa } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

type Props = {
  categorias: MenuCategoria[];
  selectedCategoriaIds: string[];
  onToggleCategoria: (id: string) => void;
  mesa?: Mesa;
  cliente?: string;
};

export function MeseroPasoCategoria({
  categorias,
  selectedCategoriaIds,
  onToggleCategoria,
  mesa,
  cliente,
}: Props) {
  const clienteLabel = cliente?.trim();
  const selected = new Set(selectedCategoriaIds);
  const count = selectedCategoriaIds.length;

  return (
    <div className="space-y-4">
      <MeseroStepHeader
        stepLabel="Paso 3"
        title="Elige sabores"
        description="Marca una o varias categorías. Luego eliges productos de todas ellas."
      />

      {(mesa || clienteLabel) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {mesa && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm">
              <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
              <span className="font-semibold">{mesa.nombre}</span>
            </span>
          )}
          {clienteLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-white px-3 py-1.5 text-slate-700 shadow-sm">
              <User className="h-3 w-3 shrink-0 text-slate-500" />
              <span className="font-semibold truncate max-w-[10rem]">{clienteLabel}</span>
            </span>
          )}
        </div>
      )}

      {count > 0 && (
        <p className="text-xs font-bold text-white/90 bg-black/20 rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" />
          {count} categor{count === 1 ? "ía" : "ías"}
        </p>
      )}

      {categorias.length === 0 ? (
        <p className="text-sm text-white/90 text-center py-10 font-medium">
          No hay categorías con productos disponibles.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {categorias.map((cat) => {
            const minPrice = Math.min(...cat.productos.map((p) => p.price), Infinity);
            const isSelected = selected.has(cat.id);
            return (
              <div key={cat.id} className="relative">
                <FlavorGridCard
                  themeId={cat.id}
                  title={cat.name}
                  subtitle={cat.description}
                  minPrice={Number.isFinite(minPrice) ? minPrice : undefined}
                  selected={isSelected}
                  onSelect={() => onToggleCategoria(cat.id)}
                />
                <span
                  className={cn(
                    "pointer-events-none absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-md border-2",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300/80 bg-white/90 text-transparent",
                  )}
                  aria-hidden
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
