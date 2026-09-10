import { describe, it, expect } from "vitest";
import { presentTotals } from "@/lib/tax";
import { COUNTRIES, countryOf, type CountryCode } from "@/lib/countries";
import type { LineItem } from "@/lib/ai/schema";

const ITEMS: LineItem[] = [
  { description: "Utrykning", quantity: 1, unitPrice: 750 },
  { description: "Arbeid", quantity: 2, unitPrice: 1150 },
];

const codes = Object.keys(COUNTRIES) as CountryCode[];

describe("presentTotals", () => {
  it.each(codes)("%s: rate 0 renders a single clean total", (code) => {
    const p = presentTotals(ITEMS, { country: code, vatRate: 0, lang: countryOf(code).lang });
    expect(p.kind).toBe("none");
    expect(p.total).toBe(3050);
    expect(p.totalLabel).toBe(countryOf(code).lang === "nb" ? "Total" : "Total");
    expect(JSON.stringify(p)).not.toMatch(/excl|ekskl/);
  });

  it("US shows no tax line even when a rate is set — one rate per business cannot model state sales tax", () => {
    const p = presentTotals(ITEMS, { country: "US", vatRate: 8.5, lang: "en" });
    expect(p.kind).toBe("none");
    expect(p.totalLabel).toBe("Total");
  });

  it("Norway breaks the tax out and keeps the inclusive headline", () => {
    const p = presentTotals(ITEMS, { country: "NO", vatRate: 25, lang: "nb" });
    expect(p).toEqual({
      kind: "breakdown",
      subtotal: 3050,
      tax: 762.5,
      total: 3812.5,
      subtotalLabel: "Delsum ekskl. mva",
      taxLabel: "MVA 25 %",
      totalLabel: "Total inkl. mva",
    });
  });

  it("takes the tax word from the registry, not from the dictionary", () => {
    const gb = presentTotals(ITEMS, { country: "GB", vatRate: 20, lang: "en" });
    expect(gb).toMatchObject({
      kind: "breakdown",
      subtotalLabel: "Subtotal excl. VAT",
      taxLabel: "VAT 20%",
      totalLabel: "Total incl. VAT",
    });

    const au = presentTotals(ITEMS, { country: "AU", vatRate: 10, lang: "en" });
    expect(au).toMatchObject({ taxLabel: "GST 10%", totalLabel: "Total incl. GST" });

    const ie = presentTotals(ITEMS, { country: "IE", vatRate: 13.5, lang: "en" });
    expect(ie).toMatchObject({ taxLabel: "VAT 13.5%" });
  });

  it("keeps subtotal + tax === total to the cent", () => {
    const p = presentTotals([{ description: "Labour", quantity: 1.5, unitPrice: 95 }], {
      country: "NO",
      vatRate: 25,
      lang: "nb",
    });
    if (p.kind !== "breakdown") throw new Error("expected a breakdown");
    expect(p.subtotal + p.tax).toBeCloseTo(p.total, 2);
    expect(p.subtotal).toBe(142.5);
    expect(p.tax).toBe(35.63);
  });

  it("handles an empty quote without inventing a breakdown", () => {
    const p = presentTotals([], { country: "NO", vatRate: 25, lang: "nb" });
    expect(p.kind).toBe("none");
    expect(p.total).toBe(0);
  });
});
