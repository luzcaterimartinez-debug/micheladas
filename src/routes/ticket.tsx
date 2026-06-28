import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { parseTicketHtml, consumePrintTicketSession } from "@/lib/ticket-print-session";

export const Route = createFileRoute("/ticket")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Comanda · Michelandia" }],
  }),
  component: TicketRoute,
});

function TicketRoute() {
  return <TicketPrintPage />;
}

function TicketPrintPage() {
  const [session] = useState(() => consumePrintTicketSession());
  const [ticketHtml] = useState(session?.html ?? "");
  const [returnUrl] = useState(session?.returnUrl ?? "/");
  const [autoPrint] = useState(session?.autoPrint ?? false);

  useEffect(() => {
    if (!session) {
      window.location.replace("/");
    }
  }, [session]);

  useEffect(() => {
    if (!autoPrint) return;

    const timer = window.setTimeout(() => window.print(), 700);
    const goBack = () => window.location.replace(returnUrl);
    window.addEventListener("afterprint", goBack, { once: true });
    window.setTimeout(goBack, 120_000);
    return () => window.clearTimeout(timer);
  }, [autoPrint, returnUrl]);

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
      <p id="ticket-print-hint">Comanda enviada. Imprime el ticket o vuelve a la app.</p>
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <div id="ticket-print-actions">
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
