import { openComandaTicketView } from "@/lib/comanda-display";
import { getStoredSession } from "@/lib/auth";
import { buildOrderDeductions } from "@/lib/inventory-deduction";
import type { FaseOpcion } from "@/lib/fases";
import type { Addition, Comanda, MicheladaType, OrderItem } from "@/lib/micheladas-store";
import { isAppOnline } from "@/lib/offline/network";
import { getPendingCount } from "@/lib/offline/outbox";

export type BarraOrderPayload = {
  cliente: string;
  mesaId?: string;
  mesa?: string;
  items: OrderItem[];
  total: number;
  clientId: string;
};

type SendDeps = {
  addComanda: (
    c: Omit<Comanda, "id" | "folio" | "queueOrder" | "createdAt" | "status">,
    clientId?: string,
  ) => Promise<Comanda>;
  decrementBatch: (deductions: Record<string, number>) => void;
  reloadInventario: () => Promise<void>;
  adiciones: Addition[];
  faseOpciones: FaseOpcion[];
};

export type SendToBarraResult =
  | { ok: true; comanda: Comanda; queued: boolean }
  | { ok: false; error: string };

/** Envía la comanda a barra y abre /ticket para imprimir. */
export async function sendToBarraAndOpenTicket(
  order: BarraOrderPayload,
  productos: MicheladaType[],
  deps: SendDeps,
): Promise<SendToBarraResult> {
  const { clientId, ...payload } = order;
  try {
    const pendingBefore = getPendingCount();
    const comanda = await deps.addComanda(payload, clientId);
    const queued = getPendingCount() > pendingBefore;

    if (!getStoredSession() || !isAppOnline() || queued) {
      deps.decrementBatch(
        buildOrderDeductions(order.items, deps.adiciones, productos, deps.faseOpciones),
      );
    } else {
      void deps.reloadInventario();
    }

    const opened = openComandaTicketView(comanda, productos, false);
    if (!opened) {
      return { ok: false, error: "Comanda enviada, pero no se pudo abrir el ticket para imprimir" };
    }

    return { ok: true, comanda, queued };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo enviar a barra",
    };
  }
}
