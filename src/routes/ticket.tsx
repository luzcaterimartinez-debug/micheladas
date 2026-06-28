import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

import { renderComandaTicket } from "@/lib/comanda-display";
import { getStoredSession } from "@/lib/auth";
import { buildOrderDeductions } from "@/lib/inventory-deduction";
import { MenuProvider, useMenu } from "@/lib/menu-context";
import { useComandas, useInventory } from "@/lib/micheladas-store";
import { isAppOnline } from "@/lib/offline/network";
import { getPendingCount } from "@/lib/offline/outbox";
import {
  clearPendingBarraOrder,
  consumePrintTicketSession,
  loadPendingBarraOrder,
  parseTicketHtml,
  type PendingBarraOrder,
} from "@/lib/ticket-print-session";

export const Route = createFileRoute("/ticket")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Comanda · Michelandia" }],
  }),
  component: TicketRoute,
});

function TicketRoute() {
  return (
    <MenuProvider>
      <Toaster position="top-center" richColors />
      <TicketPrintPage />
    </MenuProvider>
  );
}

function TicketPrintPage() {
  const { productos, adiciones, faseOpciones } = useMenu();
  const { addComanda } = useComandas();
  const { decrementBatch, reload: reloadInventario } = useInventory();

  const [session] = useState(() => consumePrintTicketSession());
  const [ticketHtml, setTicketHtml] = useState(session?.html ?? "");
  const [returnUrl] = useState(session?.returnUrl ?? "/");
  const [autoPrint] = useState(session?.autoPrint ?? false);
  const [pending, setPending] = useState<PendingBarraOrder | null>(() => loadPendingBarraOrder());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!session) {
      window.location.replace("/");
    }
  }, [session]);

  useEffect(() => {
    if (!autoPrint || pending) return;

    const timer = window.setTimeout(() => window.print(), 700);
    const goBack = () => window.location.replace(returnUrl);
    window.addEventListener("afterprint", goBack, { once: true });
    window.setTimeout(goBack, 120_000);
    return () => window.clearTimeout(timer);
  }, [autoPrint, pending, returnUrl]);

  async function handleSendToBarra() {
    if (!pending || sending) return;
    setSending(true);
    try {
      const { clientId, ...payload } = pending;
      const pendingBefore = getPendingCount();
      const c = await addComanda(payload, clientId);
      const queued = getPendingCount() > pendingBefore;

      if (!getStoredSession() || !isAppOnline() || queued) {
        decrementBatch(
          buildOrderDeductions(pending.items, adiciones, productos, faseOpciones),
        );
      } else {
        void reloadInventario();
      }

      clearPendingBarraOrder();
      setPending(null);
      setSent(true);
      setTicketHtml(renderComandaTicket(c, productos));
      toast.success(
        queued
          ? `Turno ${c.queueOrder} · Comanda #${c.folio} guardada.`
          : `Turno ${c.queueOrder} · Comanda #${c.folio} enviada a barra.`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar a barra");
    } finally {
      setSending(false);
    }
  }

  function handleBack() {
    window.location.replace(returnUrl);
  }

  if (!session || !ticketHtml) {
    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        Cargando comanda…
      </div>
    );
  }

  const { body, css } = parseTicketHtml(ticketHtml);
  const isDraft = Boolean(pending);

  return (
    <div id="michelada-ticket-print-root">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            ${css}
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              color: #000 !important;
            }
            #michelada-ticket-print-root {
              background: #fff;
              min-height: 100vh;
            }
            #ticket-print-actions {
              padding: 16px;
              text-align: center;
              font-family: system-ui, sans-serif;
              display: flex;
              flex-direction: column;
              gap: 10px;
              max-width: 320px;
              margin: 0 auto 24px;
            }
            #ticket-print-actions button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              padding: 14px 16px;
              font-size: 16px;
              font-weight: 600;
              border-radius: 10px;
              border: 1px solid #ccc;
              background: #f5f5f5;
              cursor: pointer;
            }
            #ticket-print-actions button.primary {
              background: #111;
              color: #fff;
              border-color: #111;
            }
            #ticket-print-actions button.send {
              background: #0f766e;
              color: #fff;
              border-color: #0f766e;
            }
            #ticket-print-hint {
              text-align: center;
              font-family: system-ui, sans-serif;
              font-size: 13px;
              color: #666;
              padding: 12px 16px 0;
            }
            @media print {
              #ticket-print-actions,
              #ticket-print-hint { display: none !important; }
            }
          `,
        }}
      />
      {isDraft && (
        <p id="ticket-print-hint">Revisa el ticket. Luego envía a barra o imprime.</p>
      )}
      {sent && (
        <p id="ticket-print-hint">Comanda enviada. Puedes imprimir el ticket o volver.</p>
      )}
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <div id="ticket-print-actions">
        {pending && (
          <button type="button" className="send" onClick={() => void handleSendToBarra()} disabled={sending}>
            {sending ? "Enviando…" : "Enviar a barra"}
          </button>
        )}
        <button type="button" className="primary" onClick={() => window.print()}>
          Imprimir comanda
        </button>
        <button type="button" onClick={handleBack}>
          Volver a la app
        </button>
      </div>
    </div>
  );
}
