import { useMemo } from "react";
import { Armchair, ShoppingBag } from "lucide-react";

import { MeseroStepHeader, ThemedPanel } from "@/components/michelandia/michelandia-ui";
import { MeseroMesasPorAtender } from "@/components/mesero/MeseroMesasPorAtender";
import {
  MesaCardActivityBadges,
  MeseroMesaActividad,
} from "@/components/mesero/MeseroMesaActividad";
import type { Comanda, Mesa } from "@/lib/micheladas-store";
import { getMesaActivity } from "@/lib/pos-utils";
import { cn } from "@/lib/utils";

const MESA_META: Record<
  Mesa["estado"],
  { label: string; dot: string; border: string }
> = {
  libre: {
    label: "Libre",
    dot: "bg-emerald-500",
    border: "#43a047",
  },
  ocupada: {
    label: "Ocupada",
    dot: "bg-[#1e88e5]",
    border: "#1e88e5",
  },
  reservada: {
    label: "Reservada",
    dot: "bg-amber-500",
    border: "#f9a825",
  },
};

const TOUCH =
  "touch-manipulation active:scale-[0.98] transition-all duration-150";

type Props = {
  mesas: Mesa[];
  comandas: Comanda[];
  meseroId?: number;
  mesaId: string;
  mesaDetalleId: string | null;
  mesaDetalle: Mesa | undefined;
  onSelectMesa: (id: string) => void;
  onCerrarDetalle: () => void;
  onNuevoPedido: (mesaId: string) => void;
  onMarcarComandaEntregada: (id: string) => Promise<void>;
  onMarcarMesaAtendida: (mesaId: string) => Promise<void>;
  onReloadComandas?: () => Promise<void>;
};

function MesaTile({
  mesa,
  comandas,
  selected,
  onSelect,
}: {
  mesa: Mesa;
  comandas: Comanda[];
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = MESA_META[mesa.estado];
  const activity = getMesaActivity(mesa.id, comandas);
  const hasLista = activity.listas > 0;
  const isSpecial = mesa.id === "llevar" || mesa.id === "barra";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        TOUCH,
        "relative w-full text-left rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 min-h-[5rem] shadow-lg",
        "flex flex-col justify-between gap-2",
        selected && "ring-2 ring-offset-2 ring-slate-900/25",
        hasLista && !selected && "bg-emerald-50",
        isSpecial && "min-h-[4.25rem]",
      )}
      style={{
        border: `3px solid ${meta.border}`,
        boxShadow: selected
          ? `0 8px 24px rgba(0,0,0,0.12)`
          : `0 6px 18px rgba(0,0,0,0.08)`,
      }}
    >
      {hasLista && (
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      )}
      <div className="flex items-center gap-2.5 min-w-0 pr-4">
        <span
          className={cn("h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)}
          aria-hidden
        />
        <div className="min-w-0">
          <p className="font-extrabold text-sm leading-tight tracking-tight text-slate-900">
            {mesa.nombre}
          </p>
          {mesa.capacidad > 0 && (
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
              {mesa.capacidad} personas
            </p>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between gap-2 pl-[18px]">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">{meta.label}</span>
          {mesa.cliente && (
            <p className="text-xs font-semibold truncate mt-0.5 text-slate-800">{mesa.cliente}</p>
          )}
        </div>
        {activity.activas.length > 0 && (
          <span className="text-xs font-bold tabular-nums text-slate-700 shrink-0">
            ${activity.totalCuenta}
          </span>
        )}
      </div>
      <div className="pl-[18px]">
        <MesaCardActivityBadges activity={activity} />
      </div>
    </button>
  );
}

export function MeseroPasoMesa({
  mesas,
  comandas,
  meseroId,
  mesaId,
  mesaDetalleId,
  mesaDetalle,
  onSelectMesa,
  onCerrarDetalle,
  onNuevoPedido,
  onMarcarComandaEntregada,
  onMarcarMesaAtendida,
  onReloadComandas,
}: Props) {
  const { salon, otros } = useMemo(() => {
    const special = new Set(["llevar", "barra"]);
    return {
      salon: mesas.filter((m) => !special.has(m.id)),
      otros: mesas.filter((m) => special.has(m.id)),
    };
  }, [mesas]);

  const counts = useMemo(() => {
    let libre = 0;
    let ocupada = 0;
    let reservada = 0;
    for (const m of salon) {
      if (m.estado === "libre") libre++;
      else if (m.estado === "ocupada") ocupada++;
      else if (m.estado === "reservada") reservada++;
    }
    return { libre, ocupada, reservada };
  }, [salon]);

  return (
    <div className="space-y-5">
      <MeseroStepHeader
        stepLabel="Paso 1"
        title="Elige la mesa"
        description="Toca una mesa para tomar el pedido. Las ocupadas muestran la cuenta activa."
      />

      {!mesaDetalleId && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/90 font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Libre ({counts.libre})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Ocupada ({counts.ocupada})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Reservada ({counts.reservada})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Lista para servir
          </span>
        </div>
      )}

      <MeseroMesasPorAtender
        mesas={mesas}
        comandas={comandas}
        meseroId={meseroId}
        onMarcarAtendida={onMarcarMesaAtendida}
        onReloadComandas={onReloadComandas}
      />

      {mesaDetalleId && mesaDetalle ? (
        <ThemedPanel themeId="tradicional">
          <div className="p-4">
            <MeseroMesaActividad
              mesaId={mesaDetalleId}
              mesaNombre={mesaDetalle.nombre}
              comandas={comandas}
              onCerrar={onCerrarDetalle}
              onNuevoPedido={() => onNuevoPedido(mesaDetalleId)}
              onMarcarEntregada={onMarcarComandaEntregada}
            />
          </div>
        </ThemedPanel>
      ) : (
        <>
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-wide">
              <Armchair className="h-3.5 w-3.5" />
              Salón
            </div>
            <div className="grid grid-cols-2 gap-3">
              {salon.map((m) => (
                <MesaTile
                  key={m.id}
                  mesa={m}
                  comandas={comandas}
                  selected={mesaId === m.id}
                  onSelect={() => onSelectMesa(m.id)}
                />
              ))}
            </div>
          </section>

          {otros.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white/90 uppercase tracking-wide">
                <ShoppingBag className="h-3.5 w-3.5" />
                Para llevar y barra
              </div>
              <div className="grid gap-2">
                {otros.map((m) => (
                  <MesaTile
                    key={m.id}
                    mesa={m}
                    comandas={comandas}
                    selected={mesaId === m.id}
                    onSelect={() => onSelectMesa(m.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
