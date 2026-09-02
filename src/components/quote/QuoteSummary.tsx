import { formatCurrency } from "@/lib/utils";
import type { LineItem } from "@/lib/ai/schema";

export function QuoteSummary({
  lineItems,
  total,
  summary,
  estimatedHours,
}: {
  lineItems: LineItem[];
  total: number;
  summary: string;
  estimatedHours?: number;
}) {
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
        <div className="flex items-center justify-between bg-slate-50 px-4 py-3">
          <span className="text-base font-semibold text-slate-900">Total</span>
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
