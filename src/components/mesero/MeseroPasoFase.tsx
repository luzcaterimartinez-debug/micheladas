import {
  MeseroStepHeader,
  ThemedPanel,
  ThemedPanelHeader,
} from "@/components/michelandia/michelandia-ui";
import type { FaseOpcion } from "@/lib/fases";
import { cn } from "@/lib/utils";

const TOUCH = "touch-manipulation active:scale-[0.98] transition-all duration-150";

type Props = {
  faseName: string;
  productoName: string;
  opciones: FaseOpcion[];
  selectedIds: string[];
  onToggle: (opcionId: string) => void;
};

export function MeseroPasoFase({
  faseName,
  productoName,
  opciones,
  selectedIds,
  onToggle,
}: Props) {
  return (
    <div className="space-y-4">
      <MeseroStepHeader
        title={faseName}
        description={`Elige opciones de ${faseName.toLowerCase()} para ${productoName}.`}
      />

      <ThemedPanel themeId="tradicional">
        <ThemedPanelHeader themeId="tradicional" title={faseName} subtitle={productoName} />
        <div className="flex flex-wrap gap-2 px-4 py-4 sm:px-5 sm:py-5">
          {opciones.length === 0 ? (
            <p className="text-sm text-slate-600">Sin opciones en esta fase.</p>
          ) : (
            opciones.map((op) => {
              const checked = selectedIds.includes(op.id);
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => onToggle(op.id)}
                  className={cn(
                    TOUCH,
                    "px-4 py-3 min-h-11 rounded-full border-2 text-sm font-semibold",
                    checked
                      ? "bg-[#1e88e5] text-white border-[#1e88e5]"
                      : "border-slate-200 bg-white text-slate-800 hover:border-[#1e88e5]/40",
                  )}
                >
                  {checked ? "✓ " : ""}
                  {op.name}
                </button>
              );
            })
          )}
        </div>
      </ThemedPanel>
    </div>
  );
}
