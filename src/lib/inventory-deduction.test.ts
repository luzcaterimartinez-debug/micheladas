import { describe, expect, it } from "vitest";

import { buildOrderDeductions } from "@/lib/inventory-deduction";
import type { Addition, MicheladaType, OrderItem } from "@/lib/micheladas-store";
import type { FaseOpcion } from "@/lib/fases";

const productos: MicheladaType[] = [
  {
    id: "clasica_chica",
    name: "Clásica",
    price: 48,
    description: "",
    faseOpciones: [
      { id: "tajin", name: "Tajín", faseId: "topping", stockKey: "tajin", cantidad: 1 },
    ],
    consumo: [
      { clave: "cerveza", cantidad: 1 },
      { clave: "limon", cantidad: 2 },
    ],
  },
  {
    id: "cubana_mediana",
    name: "Cubana",
    price: 75,
    description: "",
    faseOpciones: [],
  },
];

const adiciones: Addition[] = [
  { id: "camaron", name: "Camarón", price: 25, stockKey: "camaron", cantidad: 2 },
];

const faseCatalog: FaseOpcion[] = productos[0].faseOpciones;

describe("buildOrderDeductions", () => {
  it("suma consumo base del producto", () => {
    const cart: OrderItem[] = [
      {
        id: "1",
        micheladaId: "clasica_chica",
        micheladaName: "Clásica",
        basePrice: 48,
        selectedToppings: [],
        additions: [],
        total: 48,
      },
    ];
    const totals = buildOrderDeductions(cart, adiciones, productos, faseCatalog);
    expect(totals.cerveza).toBe(1);
    expect(totals.limon).toBe(2);
  });

  it("descuenta opción de fase por stockKey", () => {
    const cart: OrderItem[] = [
      {
        id: "1",
        micheladaId: "clasica_chica",
        micheladaName: "Clásica",
        basePrice: 48,
        selectedToppings: ["tajin"],
        additions: [],
        total: 48,
      },
    ];
    const totals = buildOrderDeductions(cart, adiciones, productos, faseCatalog);
    expect(totals.tajin).toBe(1);
  });

  it("descuenta adiciones por stockKey", () => {
    const cart: OrderItem[] = [
      {
        id: "1",
        micheladaId: "clasica_chica",
        micheladaName: "Clásica",
        basePrice: 48,
        selectedToppings: [],
        additions: [{ id: "camaron", name: "Camarón", price: 25 }],
        total: 73,
      },
    ];
    const totals = buildOrderDeductions(cart, adiciones, productos, faseCatalog);
    expect(totals.camaron).toBe(2);
  });

  it("usa reglas por defecto para cubana sin consumo configurado", () => {
    const cart: OrderItem[] = [
      {
        id: "1",
        micheladaId: "cubana_mediana",
        micheladaName: "Cubana",
        basePrice: 75,
        selectedToppings: [],
        additions: [],
        total: 75,
      },
    ];
    const totals = buildOrderDeductions(cart, adiciones, productos, []);
    expect(totals.cerveza).toBe(1);
    expect(totals.clamato).toBeCloseTo(0.2);
  });
});
