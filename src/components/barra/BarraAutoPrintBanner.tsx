import { Printer, PrinterCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { queueLabel } from "@/lib/comanda-queue";
import type { LastPrinted } from "@/hooks/use-auto-print-comandas";
import { cn } from "@/lib/utils";

type BarraAutoPrintBannerProps = {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  lastPrinted: LastPrinted | null;
  printedCount: number;
  className?: string;
};

export function BarraAutoPrintBanner({
  enabled,
  onEnabledChange,
  lastPrinted,
  printedCount,
  className,
}: BarraAutoPrintBannerProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3",
        enabled ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900" : "bg-muted/50",
        className,
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        {enabled ? (
          <PrinterCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <Printer className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        )}
        <div className="min-w-0">
          <p className="font-medium text-sm">
            {enabled ? "Impresión automática activa" : "Impresión automática apagada"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {enabled
              ? "Pedidos nuevos se imprimen en la AON MPR-200 (58 mm) de esta PC."
              : "Activa en la PC de barra con la MPR-200 conectada por USB."}
          </p>
          {lastPrinted && enabled && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              Último: {queueLabel(lastPrinted.queueOrder)} · #{lastPrinted.folio} ·{" "}
              {lastPrinted.cliente}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {printedCount > 0 && enabled && (
          <span className="text-xs text-muted-foreground tabular-nums">{printedCount} hoy</span>
        )}
        <div className="flex items-center gap-2">
          <Switch checked={enabled} onCheckedChange={onEnabledChange} aria-label="Impresión automática" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => window.open("/impresion", "_blank")}
          >
            Pantalla impresión
          </Button>
        </div>
      </div>
    </div>
  );
}
