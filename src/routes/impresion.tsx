import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, PrinterCheck } from "lucide-react";
import { useState } from "react";
import { Toaster } from "sonner";

import { BarraAutoPrintBanner } from "@/components/barra/BarraAutoPrintBanner";
import { PrinterSetupCard } from "@/components/barra/PrinterSetupCard";
import { Button } from "@/components/ui/button";
import { clearSession, validateSession } from "@/lib/auth";
import { queueLabel } from "@/lib/comanda-queue";
import {
  isAutoPrintEnabled,
  setAutoPrintEnabled,
  setPrintStation,
  useAutoPrintComandas,
} from "@/hooks/use-auto-print-comandas";
import { usePrintStationPoll } from "@/hooks/use-print-station-poll";
import { MenuProvider, useMenu } from "@/lib/menu-context";
import { useComandas } from "@/lib/micheladas-store";

export const Route = createFileRoute("/impresion")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Impresión · Michelandia" }],
  }),
  beforeLoad: async () => {
    const session = await validateSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    if (session.user.rol !== "cocinero" && session.user.rol !== "admin") {
      throw redirect({ to: "/" });
    }
    return { user: session.user };
  },
  component: ImpresionRoute,
});

function ImpresionRoute() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();

  return (
    <MenuProvider>
      <Toaster position="top-center" richColors />
      <ImpresionPanel
        userName={user.nombre}
        onLogout={() => {
          clearSession();
          void navigate({ to: "/login" });
        }}
      />
    </MenuProvider>
  );
}

function ImpresionPanel({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const { comandas, loading, reload } = useComandas();
  const { productos } = useMenu();
  const [autoPrint, setAutoPrint] = useState(isAutoPrintEnabled);

  usePrintStationPoll(reload, autoPrint);

  const { lastPrinted, printedCount } = useAutoPrintComandas(comandas, productos, autoPrint);

  function toggleAutoPrint(v: boolean) {
    setAutoPrintEnabled(v);
    setAutoPrint(v);
    if (v) setPrintStation(true);
  }

  const pendientes = comandas.filter((c) => c.status === "pendiente").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <PrinterCheck className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-sm">Estación de impresión</p>
            <p className="text-xs text-muted-foreground">{userName}</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-1" />
          Salir
        </Button>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        <BarraAutoPrintBanner
          enabled={autoPrint}
          onEnabledChange={toggleAutoPrint}
          lastPrinted={lastPrinted}
          printedCount={printedCount}
        />

        <PrinterSetupCard />

        <div className="rounded-xl border p-6 text-center space-y-2">
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          ) : (
            <>
              <p className="text-4xl font-bold tabular-nums">{pendientes}</p>
              <p className="text-sm text-muted-foreground">comandas en cola</p>
              {lastPrinted && autoPrint && (
                <p className="text-xs text-muted-foreground pt-2">
                  Última impresión: {queueLabel(lastPrinted.queueOrder)} · #{lastPrinted.folio}
                </p>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
          Deja esta pantalla abierta en la PC de barra con la AON MPR-200 como impresora
          predeterminada. Cuando el mesero envía desde su celular, el ticket sale aquí en unos
          segundos.
        </p>
      </main>
    </div>
  );
}
