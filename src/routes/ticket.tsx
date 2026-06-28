import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { consumePrintTicketSession, parseTicketHtml } from "@/lib/ticket-print-session";

export const Route = createFileRoute("/ticket")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Ticket · Michelandia" }],
  }),
  component: TicketPrintPage,
});

function TicketPrintPage() {
  const [payload] = useState(() => consumePrintTicketSession());

  useEffect(() => {
    if (!payload) {
      window.location.replace("/");
      return;
    }
    if (!payload.autoPrint) return;

    const timer = window.setTimeout(() => {
      window.print();
    }, 700);

    const goBack = () => {
      window.location.replace(payload.returnUrl);
    };

    window.addEventListener("afterprint", goBack, { once: true });
    window.setTimeout(goBack, 120_000);

    return () => window.clearTimeout(timer);
  }, [payload]);

  if (!payload) {
    return (
      <div style={{ padding: 24, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        Cargando ticket…
      </div>
    );
  }

  const { body, css } = parseTicketHtml(payload.html);

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
              gap: 8px;
              max-width: 280px;
              margin: 0 auto;
            }
            #ticket-print-actions button {
              padding: 12px 16px;
              font-size: 16px;
              border-radius: 8px;
              border: 1px solid #ccc;
              background: #f5f5f5;
            }
            #ticket-print-actions button.primary {
              background: #111;
              color: #fff;
              border-color: #111;
            }
            @media print {
              #ticket-print-actions { display: none !important; }
            }
          `,
        }}
      />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <div id="ticket-print-actions">
        <button type="button" className="primary" onClick={() => window.print()}>
          Imprimir ticket
        </button>
        <button type="button" onClick={() => window.location.replace(payload.returnUrl)}>
          Volver a la app
        </button>
      </div>
    </div>
  );
}
