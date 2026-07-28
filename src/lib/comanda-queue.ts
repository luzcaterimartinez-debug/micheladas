import type { Comanda } from "@/lib/micheladas-store";
import { isSameAppDay } from "@/lib/local-date";

/** Orden de cola del día (1 = siguiente en barra / impresión). */
export function sortComandasByQueue(a: Comanda, b: Comanda): number {
  const oa = a.queueOrder ?? 0;
  const ob = b.queueOrder ?? 0;
  if (oa !== ob) return oa - ob;
  return a.createdAt - b.createdAt;
}

export function nextQueueOrderForToday(comandas: Comanda[]): number {
  const max = comandas
    .filter((c) => isSameAppDay(c.createdAt))
    .reduce((m, c) => Math.max(m, c.queueOrder ?? 0), 0);
  return max + 1;
}

export function queueLabel(order: number): string {
  return `Turno ${order}`;
}
