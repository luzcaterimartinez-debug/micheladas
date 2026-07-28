import { describe, expect, it } from "vitest";

import { calcItemLineTotal, calcItemTotal, LLEVAR_EXTRA } from "@/lib/micheladas-store";

describe("calcItemTotal", () => {
  it("suma precio base y adiciones", () => {
    const total = calcItemTotal(60, [
      { id: "a", name: "Extra", price: 10 },
      { id: "b", name: "Otro", price: 15 },
    ]);
    expect(total).toBe(85);
  });

  it("sin adiciones devuelve base", () => {
    expect(calcItemTotal(48, [])).toBe(48);
  });

  it("suma cargo para llevar por unidad", () => {
    expect(calcItemTotal(5000, [], LLEVAR_EXTRA)).toBe(6000);
    expect(calcItemLineTotal(5000, [], 2, LLEVAR_EXTRA)).toBe(12000);
  });

  it("multiplica precio de adición por cantidad", () => {
    expect(
      calcItemTotal(10000, [{ id: "cereza", name: "Cereza", price: 3000, quantity: 2 }]),
    ).toBe(16000);
  });
});
