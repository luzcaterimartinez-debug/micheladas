import { describe, expect, it } from "vitest";

import { buildBatchMeseroSteps, buildMeseroSteps, getMeseroStepLabel, isCervezaProduct } from "@/lib/product-steps";
import type { Fase } from "@/lib/fases";
import type { MicheladaType } from "@/lib/micheladas-store";

const fases: Fase[] = [
  {
    id: "topping",
    name: "Topping",
    opciones: [{ id: "chamoy", name: "Chamoy", faseId: "topping" }],
  },
  { id: "nectar", name: "Néctar", opciones: [] },
];

const producto: MicheladaType = {
  id: "clasica_chica",
  name: "Clásica",
  price: 48,
  description: "",
  faseOpciones: [{ id: "chamoy", name: "Chamoy", faseId: "topping" }],
  pasos: ["fase:topping", "notas"],
};

const cerveza: MicheladaType = {
  id: "tradicional_cerveza",
  name: "Tradicional · Cerveza",
  price: 11000,
  description: "",
  faseOpciones: [],
  pasos: ["notas"],
};

describe("product-steps", () => {
  it("buildMeseroSteps incluye pasos fijos y fases con opciones", () => {
    const steps = buildMeseroSteps(producto.pasos, producto, ["topping", "nectar"]);
    expect(steps[0]).toBe("mesa");
    expect(steps).toContain("fase:topping");
    expect(steps).not.toContain("fase:nectar");
    expect(steps).toContain("notas");
    expect(steps).toContain("carrito");
  });

  it("buildBatchMeseroSteps incluye notas antes del carrito", () => {
    const steps = buildBatchMeseroSteps(producto, ["topping", "nectar"]);
    expect(steps).toContain("fase:topping");
    expect(steps.indexOf("adiciones")).toBeLessThan(steps.indexOf("notas"));
    expect(steps.indexOf("notas")).toBeLessThan(steps.indexOf("carrito"));
  });

  it("productos *_cerveza fuerzan paso tipo de cerveza", () => {
    expect(isCervezaProduct(cerveza)).toBe(true);
    const steps = buildMeseroSteps(cerveza.pasos, cerveza, []);
    expect(steps).toContain("fase:cerveza");
    const batch = buildBatchMeseroSteps(cerveza, []);
    expect(batch).toContain("fase:cerveza");
  });

  it("getMeseroStepLabel usa nombre de fase", () => {
    expect(getMeseroStepLabel("fase:topping", fases)).toBe("Topping");
    expect(getMeseroStepLabel("fase:cerveza", fases)).toBe("Tipo de cerveza");
    expect(getMeseroStepLabel("carrito", fases)).toBe("Enviar pedido");
  });
});
