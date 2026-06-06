import { describe, expect, it } from "vitest";

import { nextQueueOrderForToday, sortComandasByQueue } from "@/lib/comanda-queue";
import type { Comanda } from "@/lib/micheladas-store";

function comanda(partial: Partial<Comanda> & Pick<Comanda, "id" | "queueOrder">): Comanda {
  return {
    folio: 1,
    cliente: "Test",
    items: [],
    total: 0,
    createdAt: Date.now(),
    status: "pendiente",
    ...partial,
  };
}

describe("comanda-queue", () => {
  it("ordena por turno y luego por hora", () => {
    const a = comanda({ id: "a", queueOrder: 3, createdAt: 100 });
    const b = comanda({ id: "b", queueOrder: 1, createdAt: 200 });
    expect([a, b].sort(sortComandasByQueue).map((c) => c.id)).toEqual(["b", "a"]);
  });

  it("asigna siguiente turno del día", () => {
    const today = Date.now();
    const list = [
      comanda({ id: "1", queueOrder: 2, createdAt: today }),
      comanda({ id: "2", queueOrder: 5, createdAt: today - 86400000 }),
    ];
    expect(nextQueueOrderForToday(list)).toBe(3);
  });
});
