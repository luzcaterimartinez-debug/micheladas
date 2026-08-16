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

  it("no multiplica adiciones por la cantidad de bebidas", () => {
    const sevenAdds = Array.from({ length: 7 }, (_, i) => ({
      id: `a${i}`,
      name: `Ad ${i}`,
      price: 3000,
    }));
    // 4 × $14.000 + 7 × $3.000 = $77.000 (no $140.000)
    expect(calcItemLineTotal(14000, sevenAdds, 4)).toBe(77000);
  });

  it("para llevar sí se cobra por unidad; adiciones no", () => {
    expect(
      calcItemLineTotal(14000, [{ id: "fresa", name: "Fresa", price: 3000 }], 2, LLEVAR_EXTRA),
    ).toBe(14000 * 2 + LLEVAR_EXTRA * 2 + 3000);
  });
});
