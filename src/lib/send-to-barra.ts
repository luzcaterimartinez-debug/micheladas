import { openComandaTicketView } from "@/lib/comanda-display";
import { getStoredSession } from "@/lib/auth";
import { buildOrderDeductions } from "@/lib/inventory-deduction";
import type { FaseOpcion } from "@/lib/fases";
import type { Addition, Comanda, MicheladaType, OrderItem } from "@/lib/micheladas-store";
import { isAppOnline } from "@/lib/offline/network";
import { getPendingCount } from "@/lib/offline/outbox";
import { armMeseroFreshStart } from "@/lib/ticket-print-session";

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
  /** Marca la comanda como atendida (entregada) tras enviarla. */
  markEntregada: (id: string) => Promise<void>;
  decrementBatch: (deductions: Record<string, number>) => void;
  reloadInventario: () => Promise<void>;
  adiciones: Addition[];
  faseOpciones: FaseOpcion[];
  /** Limpia carrito / wizard justo antes de ir a /ticket (evita reenvíos con atrás). */
  beforeOpenTicket?: () => void;
};

export type SendToBarraResult =
  | { ok: true; comanda: Comanda; queued: boolean }
  | { ok: false; error: string };

/** Envía la comanda a barra, la marca atendida y abre /ticket para imprimir. */
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

    // Admin / caja: el pedido llega como atendido (entregada), no pendiente.
    let finalComanda: Comanda = { ...comanda, status: "entregada" };
    try {
      await deps.markEntregada(comanda.id);
    } catch {
      // Si falla el patch, igual devolvemos la comanda; el envío ya ocurrió.
      finalComanda = comanda;
    }

    if (!getStoredSession() || !isAppOnline() || queued) {
      deps.decrementBatch(
        buildOrderDeductions(order.items, deps.adiciones, productos, deps.faseOpciones),
      );
    } else {
      void deps.reloadInventario();
    }

    armMeseroFreshStart();
    deps.beforeOpenTicket?.();

    const opened = openComandaTicketView(finalComanda, productos, false);
    if (!opened) {
      return {
        ok: false,
        error: "Comanda enviada, pero no se pudo abrir el ticket para imprimir",
      };
    }

    return { ok: true, comanda: finalComanda, queued };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "No se pudo enviar a barra",
    };
  }
}
