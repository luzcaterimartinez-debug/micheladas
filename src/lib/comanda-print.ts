import { printComandaDialogNow, openPrintPopup, printComanda } from "@/lib/comanda-display";
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

/** Siempre true: al enviar se abre el diálogo de impresión en cualquier dispositivo. */
export function shouldPrintOnSend(): boolean {
  return true;
}

/**
 * Abre una ventana popup vacía SINCRÓNICAMENTE dentro del gesto del usuario.
 * Llámalo ANTES de cualquier await en el handler del botón "Enviar a barra".
 * Luego pasa el resultado a printComandaOnSend().
 */
export { openPrintPopup };

/**
 * Completa la impresión usando el popup ya abierto sincrónicamente.
 * Recibe el popup que fue abierto ANTES del await en el handler del click.
 */
export function printComandaOnSend(
  comanda: Comanda,
  productos: MicheladaType[],
  preOpenedPopup?: Window | null,
): boolean {
  if (typeof window === "undefined") return false;
  printComandaDialogNow(comanda, productos, preOpenedPopup);
  return true;
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
