import { describe, expect, it } from "vitest";

import { buildMeseroSteps, getMeseroStepLabel } from "@/lib/product-steps";
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

describe("product-steps", () => {
  it("buildMeseroSteps incluye pasos fijos y fases con opciones", () => {
    const steps = buildMeseroSteps(producto.pasos, producto, ["topping", "nectar"]);
    expect(steps[0]).toBe("mesa");
    expect(steps).toContain("fase:topping");
    expect(steps).not.toContain("fase:nectar");
    expect(steps).toContain("notas");
    expect(steps).toContain("carrito");
  });

  it("getMeseroStepLabel usa nombre de fase", () => {
    expect(getMeseroStepLabel("fase:topping", fases)).toBe("Topping");
    expect(getMeseroStepLabel("carrito", fases)).toBe("Enviar pedido");
  });
});
