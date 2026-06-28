import { useState } from "react";
import { Download, Share, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  className?: string;
  /** Texto del botón (omitir en size="icon") */
  label?: string;
  /** Estilo claro sobre fondo Michelandia */
  light?: boolean;
};

export function PwaInstallButton({
  variant = "outline",
  size = "sm",
  className,
  label = "Instalar app",
  light = false,
}: Props) {
  const { canInstall, install } = usePwaInstall();
  const [iosOpen, setIosOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!canInstall) return null;

  async function handleClick() {
    setBusy(true);
    try {
      const result = await install();
      if (result === "ios") {
        setIosOpen(true);
      } else if (result === "accepted") {
        toast.success("App instalada");
      } else if (result === "unavailable") {
        toast.message("Instalación no disponible", {
          description: "Usa el menú del navegador: Instalar aplicación o Agregar a inicio.",
        });
      }
    } finally {
      setBusy(false);
    }
  }

  const ghostLight =
    light &&
    "text-white/90 hover:text-white hover:bg-white/15 border-transparent bg-white/10";

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(
          size === "icon" ? "h-9 w-9 shrink-0" : "gap-1.5 font-semibold",
          ghostLight,
          className,
        )}
        onClick={() => void handleClick()}
        disabled={busy}
        aria-label={label}
      >
        <Download className={size === "icon" ? "h-[1.125rem] w-[1.125rem]" : "h-4 w-4"} />
        {size !== "icon" && label}
      </Button>

      <Dialog open={iosOpen} onOpenChange={setIosOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Instalar en iPhone / iPad
            </DialogTitle>
            <DialogDescription asChild>
              <ol className="mt-3 space-y-3 text-sm text-foreground list-none">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                    1
                  </span>
                  <span>
                    Toca <Share className="inline h-4 w-4 align-text-bottom mx-0.5" />{" "}
                    <strong>Compartir</strong> en la barra de Safari.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                    2
                  </span>
                  <span>
                    Elige <strong>Agregar a inicio</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">
                    3
                  </span>
                  <span>
                    Confirma con <strong>Agregar</strong>. La app quedará en tu pantalla de inicio.
                  </span>
                </li>
              </ol>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
