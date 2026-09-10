import { calcTotals } from "@/lib/vat";
import { countryOf, type CountryCode, type Lang } from "@/lib/countries";
import { t } from "@/lib/i18n";
import type { LineItem } from "@/lib/ai/schema";

/**
 * The single presenter every total goes through. `calcTotals` does the
 * arithmetic and has no opinion about labels; this decides what the customer
 * actually sees, and the `kind` discriminant makes it impossible to render
 * half a breakdown by accident.
 */
export type TaxPresentation =
  | { kind: "none"; total: number; totalLabel: string }
  | {
      kind: "breakdown";
      subtotal: number;
      tax: number;
      total: number;
      subtotalLabel: string;
      taxLabel: string;
      totalLabel: string;
    };

export function presentTotals(
  lineItems: LineItem[],
  opts: { country: CountryCode; vatRate: number; lang: Lang }
): TaxPresentation {
  const c = countryOf(opts.country);
  const { subtotal, vat, total } = calcTotals(lineItems, opts.vatRate);

  // Rate 0 is a legitimate, common state (not VAT-registered): the whole
  // breakdown disappears — no "VAT 0%" row, no "excl." qualifier, plain "Total".
  // An empty (or free) quote gets the same treatment: a breakdown of nothing.
  if (opts.vatRate <= 0 || subtotal <= 0 || c.tax.consumerDisplay === "none") {
    return { kind: "none", total, totalLabel: t("quote.total", opts.lang) };
  }

  return {
    kind: "breakdown",
    subtotal,
    tax: vat,
    total,
    subtotalLabel: t("quote.subtotalExTax", opts.lang, { tax: c.tax.labelInline }),
    taxLabel: t("quote.taxAtRate", opts.lang, { tax: c.tax.label, rate: opts.vatRate }),
    totalLabel: t("quote.totalInclTax", opts.lang, { tax: c.tax.labelInline }),
  };
}
