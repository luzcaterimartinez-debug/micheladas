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

  it("normalizeProductPasos por defecto usa fases activas", () => {
    const out = normalizeProductPasos(undefined, ["topping"]);
    expect(out[0]).toBe("fase:topping");
    expect(out).toContain("notas");
  });
});
