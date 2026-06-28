import { ExternalLink, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { printTestTicket } from "@/lib/comanda-display";
import {
  DEFAULT_PRINTER,
  isPrintStationMarked,
  setPrintStation,
} from "@/lib/printer-config";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function PrinterSetupCard({ className }: Props) {
  const marked = typeof window !== "undefined" && isPrintStationMarked();

  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-3 text-sm", className)}>
      <div className="flex items-start gap-3">
        <Printer className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Impresora {DEFAULT_PRINTER.model}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Térmica {DEFAULT_PRINTER.paperMm} mm · USB o Bluetooth · papel de recibo
          </p>
        </div>
      </div>

      <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside leading-relaxed">
        <li>Conecta la MPR-200 por USB e instala el driver de AON.</li>
        <li>En Windows: Configuración → Impresoras → <strong>MPR-200 como predeterminada</strong>.</li>
        <li>
          Abre Chrome en esta PC con impresión silenciosa:
          <code className="block mt-1 p-2 rounded bg-muted text-[10px] break-all">
            chrome.exe --kiosk-printing --app=https://micheladas-black.vercel.app/impresion
          </code>
        </li>
        <li>Activa impresión automática y deja esta pestaña abierta.</li>
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t">
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
          <Switch
            checked={marked}
            onCheckedChange={(v) => setPrintStation(v)}
            aria-label="Marcar como estación de impresión"
          />
          Este equipo es la estación de barra
        </label>
        <Button type="button" variant="outline" size="sm" onClick={() => printTestTicket()}>
          Imprimir prueba
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        El mesero envía desde el celular; el ticket sale solo aquí. Sin{" "}
        <code className="text-[10px]">--kiosk-printing</code>, Chrome puede pedir confirmar cada
        ticket la primera vez.
      </p>
    </div>
  );
}
