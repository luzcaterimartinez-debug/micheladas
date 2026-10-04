import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { getStoredSession } from "@/lib/auth";
import { homePathForRole } from "@/lib/auth-routes";
import { parseTicketHtml, consumePrintTicketSession } from "@/lib/ticket-print-session";

function homeUrl(): string {
  const session = getStoredSession();
  return session ? homePathForRole(session.user.rol) : "/";
}

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
  const [autoPrint] = useState(session?.autoPrint ?? false);

  useEffect(() => {
    if (!session) {
      window.location.replace("/");
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;

    // En Android, afterprint llega antes de que el sistema genere la hoja: si navegamos
    // en ese momento se imprime la pantalla de inicio. Solo salir con el diálogo cerrado.
    let done = false;
    let printed = false;
    const timers: number[] = [];

    const pageIsBack = () => document.visibilityState === "visible" && document.hasFocus();

    const goHome = () => {
      if (done) return;
      done = true;
      window.location.replace(homeUrl());
    };

    const tryGoHome = () => {
      if (printed && pageIsBack()) timers.push(window.setTimeout(goHome, 800));
    };

    const onAfterPrint = () => {
      printed = true;
      timers.push(window.setTimeout(tryGoHome, 1500));
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") tryGoHome();
    };

    window.addEventListener("afterprint", onAfterPrint);
    window.addEventListener("focus", tryGoHome);
    document.addEventListener("visibilitychange", onVisibility);

    if (autoPrint) {
      timers.push(window.setTimeout(() => window.print(), 700));
      timers.push(
        window.setTimeout(() => {
          printed = true;
          tryGoHome();
        }, 120_000),
      );
    }

    return () => {
      window.removeEventListener("afterprint", onAfterPrint);
      window.removeEventListener("focus", tryGoHome);
      document.removeEventListener("visibilitychange", onVisibility);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [session, autoPrint]);

  function handleBack() {
    window.location.replace(homeUrl());
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
      <p id="ticket-print-hint">Comanda enviada. Imprime el ticket o vuelve para tomar otro pedido.</p>
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <div id="ticket-print-actions">
        <button type="button" className="primary" onClick={() => window.print()}>
          Imprimir comanda
        </button>
        <button type="button" onClick={handleBack}>
          Nuevo pedido
        </button>
      </div>
    </div>
  );
}
