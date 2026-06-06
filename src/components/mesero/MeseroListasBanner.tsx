import { Bell, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ComandaViewDialog } from "@/components/ComandaViewDialog";
import { ThemedPanel } from "@/components/michelandia/michelandia-ui";
import type { Comanda } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

type Props = {
  listas: Comanda[];
  onMarcarEntregada: (id: string) => Promise<void>;
  className?: string;
};

export function MeseroListasBanner({ listas, onMarcarEntregada, className }: Props) {
  if (listas.length === 0) return null;

  async function entregar(id: string, folio: number) {
    try {
      await onMarcarEntregada(id);
      toast.success(`Comanda #${folio} entregada`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <ThemedPanel themeId="adiciones" className={cn("mt-0", className)}>
      <div className="px-3 py-3 space-y-2">
        <p className="text-xs font-extrabold text-[#2e7d32] flex items-center gap-1.5 uppercase tracking-wide">
          <Bell className="h-3.5 w-3.5" />
          {listas.length} listo{listas.length === 1 ? "" : "s"} para servir
        </p>
        <ul className="space-y-1.5">
          {listas.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2"
            >
              <div className="min-w-0 text-sm">
                <p className="font-bold truncate text-slate-900">
                  #{c.folio} · {c.mesa ?? "—"} · {c.cliente}
                </p>
                <p className="text-xs text-slate-500">${c.total}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <ComandaViewDialog comanda={c} size="sm" variant="ghost" label="Detalle" />
                <Button
                  type="button"
                  size="sm"
                  className="h-9 gap-1 font-bold bg-[#2e7d32] hover:bg-[#1b5e20]"
                  onClick={() => void entregar(c.id, c.folio)}
                >
                  <Check className="h-3.5 w-3.5" />
                  Servido
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ThemedPanel>
  );
}
