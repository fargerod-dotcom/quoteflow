import { formatCurrency, formatNumber } from "@/lib/utils";
import { presentTotals } from "@/lib/tax";
import { t } from "@/lib/i18n";
import type { CountryCode, Lang } from "@/lib/countries";
import type { LineItem } from "@/lib/ai/schema";

export function QuoteSummary({
  lineItems,
  vatRate,
  summary,
  estimatedHours,
  country,
  lang,
}: {
  lineItems: LineItem[];
  /** Tax percentage applied on top of the ex-tax line items. */
  vatRate: number;
  summary: string;
  estimatedHours?: number;
  country: CountryCode;
  lang: Lang;
}) {
  const totals = presentTotals(lineItems, { country, lang, vatRate });
  return (
    <div>
      <p className="text-[15px] leading-relaxed text-slate-700">{summary}</p>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        {lineItems.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-sm">
            <span className="text-slate-700">
              {item.description}
              {item.quantity !== 1 && <span className="text-slate-400"> × {item.quantity}</span>}
            </span>
            <span className="whitespace-nowrap font-medium text-slate-900">
              {formatCurrency(item.quantity * item.unitPrice, country)}
            </span>
          </div>
        ))}
        {totals.kind === "breakdown" && (
          <div className="space-y-1 bg-slate-50 px-4 pt-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>{totals.subtotalLabel}</span>
              <span>{formatCurrency(totals.subtotal, country)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{totals.taxLabel}</span>
              <span>{formatCurrency(totals.tax, country)}</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
          <span className="text-base font-semibold text-slate-900">{totals.totalLabel}</span>
          <span className="text-xl font-bold text-brand-600">{formatCurrency(totals.total, country)}</span>
        </div>
      </div>
      {estimatedHours !== undefined && estimatedHours > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          {t("quote.timeOnSite", lang, { hours: formatNumber(estimatedHours, country) })}
        </p>
      )}
    </div>
  );
}
