import { describe, expect, it } from "vitest";

import {
  fasePasoId,
  isFasePaso,
  normalizeProductPasos,
  parseFaseIdFromPaso,
} from "@/lib/fases";

describe("fases", () => {
  it("fasePasoId genera prefijo correcto", () => {
    expect(fasePasoId("topping")).toBe("fase:topping");
  });

  it("parseFaseIdFromPaso lee fase y legacy toppings", () => {
    expect(parseFaseIdFromPaso("fase:nectar")).toBe("nectar");
    expect(parseFaseIdFromPaso("toppings")).toBe("topping");
    expect(parseFaseIdFromPaso("notas")).toBeNull();
  });

  it("isFasePaso detecta pasos de fase", () => {
    expect(isFasePaso("fase:topping")).toBe(true);
    expect(isFasePaso("notas")).toBe(false);
  });

  it("normalizeProductPasos migra legacy y agrega notas", () => {
    const out = normalizeProductPasos(["toppings"], ["topping", "nectar"]);
    expect(out).toContain("fase:topping");
    expect(out).toContain("notas");
  });

  it("normalizeProductPasos por defecto solo notas (fases opcionales)", () => {
    const out = normalizeProductPasos(undefined, ["topping"]);
    expect(out).toEqual(["notas"]);
  });

  it("normalizeProductPasos no fuerza fases si el producto no las tiene", () => {
    const out = normalizeProductPasos(["notas"], ["topping", "nectar"]);
    expect(out).toEqual(["notas"]);
  });
});
