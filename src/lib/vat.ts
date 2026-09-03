import type { LineItem } from "@/lib/ai/schema";

export type QuoteTotals = { subtotal: number; vat: number; total: number };

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Line items are priced ex-MVA; MVA is added on top at the given percentage. */
export function calcTotals(lineItems: LineItem[], vatRate: number): QuoteTotals {
  const subtotal = round2(lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0));
  const vat = round2(subtotal * (Number(vatRate) / 100));
  return { subtotal, vat, total: round2(subtotal + vat) };
}
