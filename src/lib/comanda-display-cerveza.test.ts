import { describe, expect, it } from "vitest";

import { cervezaTipoName, orderItemDisplayName, orderItemLabel } from "@/lib/comanda-display";
import type { MicheladaType, OrderItem } from "@/lib/micheladas-store";

const productos: MicheladaType[] = [
  {
    id: "tradicional_cerveza",
    name: "Tradicional · Cerveza",
    price: 12000,
    description: "",
    faseOpciones: [
      { id: "tipo_cerveza_light", name: "Light", faseId: "cerveza", stockKey: "cerveza_light", cantidad: 1 },
      { id: "tipo_aguila", name: "Águila", faseId: "cerveza", stockKey: "aguila", cantidad: 1 },
    ],
  },
];

function item(partial: Partial<OrderItem> & Pick<OrderItem, "micheladaName" | "selectedToppings">): OrderItem {
  return {
    id: "1",
    micheladaId: "tradicional_cerveza",
    basePrice: 12000,
    additions: [],
    total: 12000,
    ...partial,
  };
}

describe("orderItemDisplayName cerveza", () => {
  it("reemplaza Cerveza por Light en el ticket", () => {
    const it = item({
      micheladaName: "Tradicional · Cerveza",
      selectedToppings: ["tipo_cerveza_light"],
    });
    expect(cervezaTipoName(it, productos)).toBe("Light");
    expect(orderItemDisplayName(it, productos)).toBe("Tradicional · Light");
    expect(orderItemLabel(it, productos)).toBe("Tradicional · Light");
  });

  it("usa Águila cuando corresponde", () => {
    const it = item({
      micheladaName: "Lulo · Cerveza",
      selectedToppings: ["tipo_aguila"],
    });
    expect(orderItemDisplayName(it, productos)).toBe("Lulo · Águila");
  });

  it("resuelve marca aunque no esté en faseOpciones del producto (fallback)", () => {
    const it = item({
      micheladaName: "Tradicional · Cerveza",
      selectedToppings: ["tipo_poker"],
    });
    expect(orderItemDisplayName(it, productos)).toBe("Tradicional · Poker");
  });
});
