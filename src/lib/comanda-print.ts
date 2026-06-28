import { printComanda } from "@/lib/comanda-display";
import { isAutoPrintEnabled, isPrintStation, isRawBtPreferred } from "@/lib/printer-config";
import type { Comanda, MicheladaType } from "@/lib/micheladas-store";

export const COMANDA_NUEVA_EVENT = "michelada-comanda-nueva";

const PRINTED_KEY = "micheladas_printed_comandas";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadPrintedIds(): Set<string> {
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

export function savePrintedIds(ids: Set<string>): void {
  localStorage.setItem(
    PRINTED_KEY,
    JSON.stringify({ date: todayKey(), ids: [...ids] }),
  );
}

export function isComandaPrinted(id: string): boolean {
  return loadPrintedIds().has(id);
}

export function markComandaPrinted(id: string): void {
  if (typeof window === "undefined") return;
  const ids = loadPrintedIds();
  if (ids.has(id)) return;
  ids.add(id);
  savePrintedIds(ids);
}

export function notifyComandaNueva(comanda: Comanda): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COMANDA_NUEVA_EVENT, { detail: comanda }));
}

/** ¿Este equipo debe imprimir al pulsar "Enviar a barra"? */
export function shouldPrintOnSend(): boolean {
  if (!isAutoPrintEnabled()) return false;
  if (isPrintStation()) return true;
  if (isRawBtPreferred() && /Android/i.test(navigator.userAgent)) return true;
  return false;
}

/** Imprime al enviar (tablet con RawBT o estación /impresion en la misma sesión). */
export function printComandaOnSend(comanda: Comanda, productos: MicheladaType[]): void {
  if (typeof window === "undefined") return;
  if (!shouldPrintOnSend()) return;
  if (isComandaPrinted(comanda.id)) return;
  markComandaPrinted(comanda.id);
  printComanda(comanda, productos, { silent: true });
}

export function printComandaIfNew(
  comanda: Comanda,
  productos: MicheladaType[],
  printedIds: Set<string>,
): boolean {
  if (comanda.status !== "pendiente") return false;
  if (printedIds.has(comanda.id)) return false;
  printedIds.add(comanda.id);
  savePrintedIds(printedIds);
  printComanda(comanda, productos, { silent: true });
  return true;
}
