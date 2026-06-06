import { useMemo } from "react";
import { MapPin, Pencil, User } from "lucide-react";

import { MeseroStepHeader, ThemedPanel } from "@/components/michelandia/michelandia-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Mesa } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

const TOUCH = "touch-manipulation active:scale-[0.98] transition-all duration-150";

type Props = {
  mesa?: Mesa;
  cliente: string;
  onClienteChange: (value: string) => void;
  onCambiarMesa: () => void;
};

function buildSuggestions(mesa?: Mesa): string[] {
  const out: string[] = [];
  if (mesa?.cliente?.trim()) out.push(mesa.cliente.trim());
  if (mesa?.id === "llevar") {
    out.push("Para llevar");
    out.push("Mostrador");
  }
  return [...new Set(out)].slice(0, 4);
}

export function MeseroPasoCliente({
  mesa,
  cliente,
  onClienteChange,
  onCambiarMesa,
}: Props) {
  const suggestions = useMemo(() => buildSuggestions(mesa), [mesa]);
  const trimmed = cliente.trim();
  const maxLen = 40;

  return (
    <div className="space-y-4">
      <MeseroStepHeader
        stepLabel="Paso 2"
        title="Nombre del cliente"
        description="¿Quién hace el pedido? Elige una sugerencia o escribe el nombre."
      />

      <ThemedPanel themeId="tradicional">
        {mesa && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-dashed border-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
                  Mesa
                </p>
                <p className="text-sm font-bold truncate text-slate-800">{mesa.nombre}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCambiarMesa}
              className={cn(
                TOUCH,
                "shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md",
              )}
            >
              <Pencil className="h-3 w-3" />
              Cambiar
            </button>
          </div>
        )}

        <div className="px-4 py-4 sm:px-5 sm:py-5 space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="cliente" className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Cliente
            </Label>
            <span className="text-[11px] text-slate-500 tabular-nums font-medium">
              {trimmed.length}/{maxLen}
            </span>
          </div>
          <Input
            id="cliente"
            value={cliente}
            onChange={(e) => onClienteChange(e.target.value)}
            placeholder="Ej. Juan, María…"
            maxLength={maxLen}
            autoFocus
            autoComplete="off"
            className={cn(
              "h-14 text-lg sm:text-base rounded-xl border-slate-300 bg-white",
              "focus-visible:ring-2 focus-visible:ring-[#1e88e5]/30",
            )}
          />

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Sugerencias
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((name) => {
                  const active = trimmed === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onClienteChange(name)}
                      className={cn(
                        TOUCH,
                        "rounded-full border-2 px-3.5 py-2 text-sm font-semibold",
                        active
                          ? "border-[#1e88e5] bg-[#1e88e5] text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:border-[#1e88e5]/50",
                      )}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ThemedPanel>
    </div>
  );
}
