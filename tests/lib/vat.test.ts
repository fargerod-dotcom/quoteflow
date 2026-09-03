import { describe, it, expect } from "vitest";
import { calcTotals } from "@/lib/vat";

describe("calcTotals", () => {
  const items = [
    { description: "Call-out", quantity: 1, unitPrice: 590 },
    { description: "Labour", quantity: 1.5, unitPrice: 950 },
  ];

  it("adds MVA on top of ex-MVA line items", () => {
    expect(calcTotals(items, 25)).toEqual({ subtotal: 2015, vat: 503.75, total: 2518.75 });
  });

  it("is a plain sum when the business is not MVA-registered", () => {
    expect(calcTotals(items, 0)).toEqual({ subtotal: 2015, vat: 0, total: 2015 });
  });

  it("rounds to øre", () => {
    const t = calcTotals([{ description: "x", quantity: 3, unitPrice: 33.33 }], 25);
    expect(t.subtotal).toBe(99.99);
    expect(t.vat).toBe(25);
    expect(t.total).toBe(124.99);
  });

  it("handles an empty list", () => {
    expect(calcTotals([], 25)).toEqual({ subtotal: 0, vat: 0, total: 0 });
  });
});
