import { formatCurrency } from "@/lib/utils";
import type { LineItem } from "@/lib/ai/schema";

export function QuoteSummary({
  lineItems,
  total,
  summary,
}: {
  lineItems: LineItem[];
  total: number;
  summary: string;
}) {
  return (
    <div>
      <p className="text-sm text-slate-700">{summary}</p>

      <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
        {lineItems.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="text-slate-700">
              {item.description} {item.quantity !== 1 ? `× ${item.quantity}` : ""}
            </span>
            <span className="font-medium text-slate-900">
              {formatCurrency(item.quantity * item.unitPrice)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
