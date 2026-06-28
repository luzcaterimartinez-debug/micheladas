import { useState } from "react";
import { ClipboardList, Eye, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { queueLabel } from "@/lib/comanda-queue";
import { faseOpcionNames, orderItemLabel, orderItemSubtitle, printComandaDialogNow } from "@/lib/comanda-display";
import { useMenu } from "@/lib/menu-context";
import type { Comanda, MicheladaType } from "@/lib/micheladas-store";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Comanda["status"], string> = {
  pendiente: "En preparación",
  lista: "Lista",
  entregada: "Entregada",
};

const STATUS_DOT: Record<Comanda["status"], string> = {
  pendiente: "bg-amber-500",
  lista: "bg-emerald-500",
  entregada: "bg-muted-foreground/40",
};

type Props = {
  comanda: Comanda;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
  label?: string;
  iconOnly?: boolean;
  /** Vista normal o confirmación antes de enviar a barra. */
  mode?: "view" | "confirm";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void | Promise<void>;
  confirming?: boolean;
  hideTrigger?: boolean;
  /** Botón que abre el diálogo: ojo (ver) o impresora (imprimir). */
  trigger?: "view" | "print";
};

function OrderItemRow({
  item,
  productos,
}: {
  item: Comanda["items"][number];
  productos: MicheladaType[];
}) {
  const tops = faseOpcionNames(item.micheladaId, item.selectedToppings, productos);
  const subtitle = orderItemSubtitle(item);
  const extras: string[] = [
    ...tops,
    ...item.additions.map((a) => (a.price > 0 ? `${a.name} +$${a.price}` : a.name)),
  ];

  return (
    <li className="py-3.5 first:pt-0">
      <div className="flex justify-between gap-4 items-baseline">
        <div className="min-w-0">
          <p className="font-medium text-[15px] leading-snug">{orderItemLabel(item)}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="text-[15px] font-medium tabular-nums shrink-0">${item.total}</span>
      </div>
      {extras.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{extras.join(" · ")}</p>
      )}
      {item.notes && (
        <p className="text-xs text-foreground/80 mt-1.5 pl-2 border-l-2 border-muted-foreground/25">
          {item.notes}
        </p>
      )}
    </li>
  );
}

export function ComandaViewDialog({
  comanda,
  size = "sm",
  variant = "outline",
  className,
  label = "Ver comanda",
  iconOnly = false,
  mode = "view",
  open: controlledOpen,
  onOpenChange,
  onConfirm,
  confirming = false,
  hideTrigger = false,
  trigger = "view",
}: Props) {
  const { productos } = useMenu();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  };

  const isConfirm = mode === "confirm";
  const isPreview = comanda.folio <= 0;
  const TriggerIcon = trigger === "print" ? Printer : Eye;
  const triggerLabel = label ?? (trigger === "print" ? "Imprimir" : "Ver comanda");

  function handlePrintTicket() {
    if (comanda.items.length === 0) return;
    if (!printComandaDialogNow(comanda, productos)) {
      toast.error("No se pudo abrir la impresión. Revisa permisos del navegador.");
    }
  }

  function handleConfirm() {
    if (!onConfirm || comanda.items.length === 0 || confirming) return;
    onConfirm();
  }

  return (
    <>
      {!hideTrigger && (
        <Button
          type="button"
          size={size}
          variant={variant}
          className={cn("gap-1.5", className)}
          onClick={() => setOpen(true)}
        >
          <TriggerIcon className="h-4 w-4" />
          {!iconOnly && triggerLabel}
        </Button>
      )}

      <Dialog open={open} onOpenChange={(v) => !confirming && setOpen(v)}>
        <DialogContent
          className="max-w-md gap-0 p-0 overflow-hidden max-h-[min(88vh,640px)] flex flex-col sm:rounded-xl z-[60]"
          onPointerDownOutside={(e) => confirming && e.preventDefault()}
          onEscapeKeyDown={(e) => confirming && e.preventDefault()}
        >
          <DialogHeader className="px-5 pt-5 pb-4 space-y-3 text-left border-b">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold tracking-tight leading-tight">
                  {isConfirm
                    ? "Confirmar pedido"
                    : isPreview
                      ? "Vista previa"
                      : `${queueLabel(comanda.queueOrder)} · Folio #${comanda.folio}`}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1 truncate">{comanda.cliente}</p>
              </div>
              {!isPreview && !isConfirm && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 pt-0.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[comanda.status])} />
                  {STATUS_LABEL[comanda.status]}
                </span>
              )}
              {isPreview && !isConfirm && (
                <span className="text-xs text-muted-foreground shrink-0">Borrador</span>
              )}
              {isConfirm && (
                <span className="text-xs text-muted-foreground shrink-0">Revisar antes de enviar</span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {comanda.mesa && <span>Mesa {comanda.mesa}</span>}
              {!isPreview && !isConfirm && (
                <span>
                  {new Date(comanda.createdAt).toLocaleString("es-MX", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {comanda.items.length > 0 && (
                <span>
                  {comanda.items.length} ítem{comanda.items.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {comanda.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Sin productos</p>
            ) : (
              <ul className="divide-y divide-border">
                {comanda.items.map((it) => (
                  <OrderItemRow key={it.id} item={it} productos={productos} />
                ))}
              </ul>
            )}
          </div>

          <div className="shrink-0 border-t px-5 py-4 space-y-4 bg-muted/20">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-semibold tabular-nums">${comanda.total}</span>
            </div>

            <Separator />

            {isConfirm ? (
              <DialogFooter className="flex-col gap-2 p-0 sm:flex-col">
                <Button
                  type="button"
                  className="w-full gap-2"
                  variant="default"
                  onClick={handlePrintTicket}
                  disabled={confirming || comanda.items.length === 0}
                >
                  <Printer className="h-4 w-4" />
                  Imprimir comanda
                </Button>
                <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => setOpen(false)}
                    disabled={confirming}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="w-full sm:w-auto gap-2"
                    onClick={handleConfirm}
                    disabled={confirming || comanda.items.length === 0}
                  >
                    {confirming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ClipboardList className="h-4 w-4" />
                    )}
                    {confirming ? "Enviando…" : "Enviar a barra"}
                  </Button>
                </div>
              </DialogFooter>
            ) : (
              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 p-0 sm:justify-end">
                <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(false)}>
                  Cerrar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5"
                  onClick={handlePrintTicket}
                  disabled={comanda.items.length === 0}
                >
                  <Printer className="h-4 w-4" />
                  Imprimir comanda
                </Button>
              </DialogFooter>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
