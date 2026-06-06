import { useEffect, useRef, useState } from "react";

import { printComanda } from "@/lib/comanda-display";
import type { Comanda, MicheladaType } from "@/lib/micheladas-store";

const PRINTED_KEY = "micheladas_printed_comandas";
const AUTO_PRINT_KEY = "micheladas_auto_print";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadPrintedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(PRINTED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as { date?: string; ids?: string[] };
    if (parsed.date !== todayKey() || !Array.isArray(parsed.ids)) return new Set();
    return new Set(parsed.ids);
  } catch {
    return new Set();
  }
}

function savePrintedIds(ids: Set<string>): void {
  localStorage.setItem(
    PRINTED_KEY,
    JSON.stringify({ date: todayKey(), ids: [...ids] }),
  );
}

export function isAutoPrintEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(AUTO_PRINT_KEY);
  return raw !== "0";
}

export function setAutoPrintEnabled(enabled: boolean): void {
  localStorage.setItem(AUTO_PRINT_KEY, enabled ? "1" : "0");
}

export type LastPrinted = {
  folio: number;
  queueOrder: number;
  cliente: string;
  at: number;
};

export function useAutoPrintComandas(
  comandas: Comanda[],
  productos: MicheladaType[],
  enabled: boolean,
) {
  const printedIds = useRef(loadPrintedIds());
  const [lastPrinted, setLastPrinted] = useState<LastPrinted | null>(null);
  const [printedCount, setPrintedCount] = useState(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const pendientes = comandas.filter((c) => c.status === "pendiente");
    for (const c of pendientes) {
      if (printedIds.current.has(c.id)) continue;
      printedIds.current.add(c.id);
      savePrintedIds(printedIds.current);
      printComanda(c, productos, { silent: true });
      setLastPrinted({
        folio: c.folio,
        queueOrder: c.queueOrder,
        cliente: c.cliente,
        at: Date.now(),
      });
      setPrintedCount((n) => n + 1);
    }
  }, [comandas, enabled, productos]);

  return { lastPrinted, printedCount };
}
