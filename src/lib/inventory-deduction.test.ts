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

  it("descuenta la base Michelandia (ginger, soda, etc.)", () => {
    const michelandia: MicheladaType[] = [
      {
        id: "tradicional_ginger",
        name: "Tradicional · Ginger",
        price: 10000,
        description: "",
        faseOpciones: [],
        consumo: [
          { clave: "ginger", cantidad: 1 },
          { clave: "limon", cantidad: 2 },
        ],
      },
      {
        id: "lulo_soda",
        name: "Lulo · Soda",
        price: 14000,
        description: "",
        faseOpciones: [],
      },
    ];
    const cart: OrderItem[] = [
      {
        id: "1",
        micheladaId: "tradicional_ginger",
        micheladaName: "Tradicional · Ginger",
        basePrice: 10000,
        selectedToppings: [],
        additions: [],
        total: 10000,
      },
      {
        id: "2",
        micheladaId: "lulo_soda",
        micheladaName: "Lulo · Soda",
        basePrice: 14000,
        selectedToppings: [],
        additions: [],
        total: 14000,
      },
    ];
    const totals = buildOrderDeductions(cart, adiciones, michelandia, []);
    expect(totals.ginger).toBe(1);
    expect(totals.soda).toBe(1);
    expect(totals.limon).toBe(4);
    expect(totals.cerveza).toBeUndefined();
  });
});
