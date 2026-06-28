import { Printer } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { printTestTicket } from "@/lib/comanda-display";
import {
  DEFAULT_PRINTER,
  isPrintStationMarked,
  isRawBtPreferred,
  setPrintStation,
  setRawBtEnabled,
} from "@/lib/printer-config";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const IS_ANDROID = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

export function PrinterSetupCard({ className }: Props) {
  const [station, setStation] = useState(
    () => typeof window !== "undefined" && isPrintStationMarked(),
  );
  const [rawBt, setRawBt] = useState(
    () => typeof window !== "undefined" && isRawBtPreferred(),
  );

  return (
    <div className={cn("rounded-xl border bg-card p-4 space-y-3 text-sm", className)}>
      <div className="flex items-start gap-3">
        <Printer className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Impresora {DEFAULT_PRINTER.model}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Térmica {DEFAULT_PRINTER.paperMm} mm · USB o Bluetooth
          </p>
        </div>
      </div>

      {IS_ANDROID ? (
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>Empareja la MPR-200 por Bluetooth en Ajustes de la tablet.</li>
          <li>
            Instala <strong>RawBT</strong> (Play Store) y selecciona la MPR-200 como impresora.
          </li>
          <li>Activa RawBT abajo y deja esta pantalla abierta en /impresion.</li>
          <li>Activa impresión automática — los tickets salen solos al enviar desde el mesero.</li>
        </ol>
      ) : (
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>Conecta la MPR-200 por USB e instala el driver de AON.</li>
          <li>En Windows: Configuración → Impresoras → <strong>MPR-200 como predeterminada</strong>.</li>
          <li>
            Abre Chrome con impresión silenciosa:
            <code className="block mt-1 p-2 rounded bg-muted text-[10px] break-all">
              chrome.exe --kiosk-printing --app=https://micheladas-black.vercel.app/impresion
            </code>
          </li>
          <li>Activa impresión automática y deja esta pestaña abierta.</li>
        </ol>
      )}

      <div className="space-y-2 pt-1 border-t">
        <label className="flex items-center justify-between gap-2 text-xs font-medium cursor-pointer">
          <span>Este equipo es la estación de barra</span>
          <Switch
            checked={station}
            onCheckedChange={(v) => {
              setPrintStation(v);
              setStation(v);
            }}
            aria-label="Marcar como estación de impresión"
          />
        </label>
        {IS_ANDROID && (
          <label className="flex items-center justify-between gap-2 text-xs font-medium cursor-pointer">
            <span>Usar RawBT (Bluetooth sin Chrome)</span>
            <Switch
              checked={rawBt}
              onCheckedChange={(v) => {
                setRawBtEnabled(v);
                setRawBt(v);
              }}
              aria-label="Imprimir con RawBT"
            />
          </label>
        )}
      </div>

      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => printTestTicket()}>
        Imprimir prueba
      </Button>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        El mesero solo envía el pedido. Esta pantalla detecta comandas nuevas cada 2 segundos e
        imprime el ticket sin tocar nada más.
      </p>
    </div>
  );
}
