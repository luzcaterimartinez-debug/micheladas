import { MapPin, Plus, User } from "lucide-react";

import { QuantityStepper } from "@/components/QuantityStepper";
import { Button } from "@/components/ui/button";
import {
  MeseroStepHeader,
  ThemedPanel,
  ThemedPanelHeader,
} from "@/components/michelandia/michelandia-ui";
import { formatMenuPrice } from "@/lib/michelandia-theme";
import type { Mesa, MicheladaType } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

const TOUCH = "touch-manipulation active:scale-[0.98] transition-all duration-150";

type AdditionLine = { name: string; price: number };

type Props = {
  michelada: MicheladaType;
  toppingLabels: string[];
  additions: AdditionLine[];
  notes?: string;
  itemTotal: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  mesa?: Mesa;
  cliente?: string;
  onAddToCart: () => void;
};

export function MeseroPasoItem({
  michelada,
  toppingLabels,
  additions,
  notes,
  itemTotal,
  quantity,
  onQuantityChange,
  mesa,
  cliente,
  onAddToCart,
}: Props) {
  const clienteLabel = cliente?.trim();
  const extras: string[] = [
    ...toppingLabels,
    ...additions.map((a) => (a.price > 0 ? `${a.name} +${formatMenuPrice(a.price)}` : a.name)),
  ];

  return (
    <div className="space-y-4">
      <MeseroStepHeader
        stepLabel="Paso 6"
        title="Confirmar ítem"
        description="Revisa el detalle antes de agregarlo al pedido."
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

      <ThemedPanel themeId="especiales">
        <ThemedPanelHeader themeId="especiales" title={michelada.name} subtitle={michelada.description} />
        <div className="px-4 py-4 space-y-3">
          {extras.length > 0 && (
            <p className="text-sm text-slate-600 leading-relaxed">{extras.join(" · ")}</p>
          )}
          {notes?.trim() && (
            <p className="text-sm text-slate-800 pl-3 border-l-2 border-amber-400 leading-relaxed">
              {notes.trim()}
            </p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-dashed border-slate-200">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                Cantidad
              </p>
              <QuantityStepper value={quantity} onChange={onQuantityChange} />
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-600 block">Total ítem</span>
              <span className="text-2xl font-black tabular-nums text-slate-900">
                {formatMenuPrice(itemTotal)}
              </span>
            </div>
          </div>
        </div>
      </ThemedPanel>

      <Button
        type="button"
        size="lg"
        className={cn(
          TOUCH,
          "w-full h-14 rounded-xl text-base font-bold gap-2 bg-slate-900 hover:bg-slate-800 text-white",
        )}
        onClick={onAddToCart}
      >
        <Plus className="h-5 w-5" />
        Agregar al pedido
      </Button>
    </div>
  );
}
