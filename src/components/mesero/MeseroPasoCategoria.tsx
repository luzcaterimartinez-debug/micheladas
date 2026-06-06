import { MapPin, User } from "lucide-react";

import {
  FlavorGridCard,
  MeseroStepHeader,
} from "@/components/michelandia/michelandia-ui";
import type { MenuCategoria } from "@/lib/menu-utils";
import type { Mesa } from "@/lib/micheladas-store";

type Props = {
  categorias: MenuCategoria[];
  selectedCategoriaId: string;
  onSelectCategoria: (id: string) => void;
  mesa?: Mesa;
  cliente?: string;
};

export function MeseroPasoCategoria({
  categorias,
  selectedCategoriaId,
  onSelectCategoria,
  mesa,
  cliente,
}: Props) {
  const clienteLabel = cliente?.trim();

  return (
    <div className="space-y-4">
      <MeseroStepHeader
        stepLabel="Paso 3"
        title="Elige el sabor"
        description="Selecciona una categoría del menú Michelandia."
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

      {categorias.length === 0 ? (
        <p className="text-sm text-white/90 text-center py-10 font-medium">
          No hay categorías con productos disponibles.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {categorias.map((cat) => {
            const minPrice = Math.min(...cat.productos.map((p) => p.price), Infinity);
            return (
              <FlavorGridCard
                key={cat.id}
                themeId={cat.id}
                title={cat.name}
                subtitle={cat.description}
                minPrice={Number.isFinite(minPrice) ? minPrice : undefined}
                selected={selectedCategoriaId === cat.id}
                onSelect={() => onSelectCategoria(cat.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
