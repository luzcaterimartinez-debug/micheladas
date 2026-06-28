import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

import {
  COMANDA_NUEVA_EVENT,
  loadPrintedIds,
  printComandaIfNew,
} from "@/lib/comanda-print";
import {
  isAutoPrintEnabled,
  isPrintStation,
  setAutoPrintEnabled,
  setPrintStation,
} from "@/lib/printer-config";
import type { Comanda, MicheladaType } from "@/lib/micheladas-store";

export { isAutoPrintEnabled, setAutoPrintEnabled, setPrintStation };
export { printComandaOnSend, markComandaPrinted, shouldPrintOnSend } from "@/lib/comanda-print";

export type LastPrinted = {
  folio: number;
  queueOrder: number;
  cliente: string;
  at: number;
};

function recordPrint(
  c: Comanda,
  setLastPrinted: (v: LastPrinted) => void,
  setPrintedCount: Dispatch<SetStateAction<number>>,
): void {
  setLastPrinted({
    folio: c.folio,
    queueOrder: c.queueOrder,
    cliente: c.cliente,
    at: Date.now(),
  });
  setPrintedCount((n) => n + 1);
}

export function useAutoPrintComandas(
  comandas: Comanda[],
  productos: MicheladaType[],
  enabled: boolean,
) {
  const printedIds = useRef(loadPrintedIds());
  const [lastPrinted, setLastPrinted] = useState<LastPrinted | null>(null);
  const [printedCount, setPrintedCount] = useState(0);

  const tryPrint = (c: Comanda) => {
    if (!enabled || !isPrintStation()) return;
    if (printComandaIfNew(c, productos, printedIds.current)) {
      recordPrint(c, setLastPrinted, setPrintedCount);
    }
  };

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !isPrintStation()) return;

    for (const c of comandas.filter((x) => x.status === "pendiente")) {
      tryPrint(c);
    }
  }, [comandas, enabled, productos]);

  useEffect(() => {
    if (!enabled || !isPrintStation()) return;

    const onNueva = (e: Event) => {
      const c = (e as CustomEvent<Comanda>).detail;
      if (c) tryPrint(c);
    };

    window.addEventListener(COMANDA_NUEVA_EVENT, onNueva);
    return () => window.removeEventListener(COMANDA_NUEVA_EVENT, onNueva);
  }, [enabled, productos]);

  return { lastPrinted, printedCount };
}
