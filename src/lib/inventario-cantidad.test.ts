import { describe, expect, it } from "vitest";

import {
  formatCantidadInventario,
  parseCantidadInventario,
} from "@/lib/inventario-cantidad";

describe("inventario-cantidad", () => {
  it("formatea cantidad con unidad", () => {
    expect(formatCantidadInventario(50, "g")).toBe("50 g");
    expect(formatCantidadInventario(0.05, "L")).toBe("0.05 L");
  });

  it("exige cantidad positiva si hay clave de inventario", () => {
    expect(parseCantidadInventario("chamoy", "")).toEqual({ ok: false, message: expect.any(String) });
    expect(parseCantidadInventario("chamoy", "50")).toEqual({ ok: true, cantidad: 50 });
    expect(parseCantidadInventario(undefined, "")).toEqual({ ok: true, cantidad: 1 });
  });
});
