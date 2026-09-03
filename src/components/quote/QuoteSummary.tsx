import { formatCurrency } from "@/lib/utils";
import { calcTotals } from "@/lib/vat";
import type { LineItem } from "@/lib/ai/schema";

export function QuoteSummary({
  lineItems,
  vatRate,
  summary,
  estimatedHours,
}: {
  lineItems: LineItem[];
  /** MVA percentage applied on top of the ex-MVA line items. */
  vatRate: number;
  summary: string;
  estimatedHours?: number;
}) {
  const { subtotal, vat, total } = calcTotals(lineItems, vatRate);
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
              {formatCurrency(item.quantity * item.unitPrice)}
            </span>
          </div>
        ))}
        {vatRate > 0 && (
          <div className="space-y-1 bg-slate-50 px-4 pt-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Subtotal ekskl. mva</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>MVA {vatRate}%</span>
              <span>{formatCurrency(vat)}</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
          <span className="text-base font-semibold text-slate-900">{vatRate > 0 ? "Total inkl. mva" : "Total"}</span>
          <span className="text-xl font-bold text-brand-600">{formatCurrency(total)}</span>
        </div>
      </div>
      {estimatedHours !== undefined && estimatedHours > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Estimated time on site: about {estimatedHours} hour{estimatedHours === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
