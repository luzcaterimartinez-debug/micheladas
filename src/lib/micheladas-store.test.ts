import { describe, expect, it } from "vitest";

import { calcItemTotal } from "@/lib/micheladas-store";

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
});
