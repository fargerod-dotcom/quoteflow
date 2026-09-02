import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";
import type { Photo, Quote, Request as JobRequest } from "@prisma/client";

type RequestWithQuote = JobRequest & { quote: Quote | null; photos?: Photo[] };

export function RequestListItem({ request }: { request: RequestWithQuote }) {
  const thumb = request.photos?.[0];
  const quote = request.quote;
  const needsReview = request.status === "NEW";

  return (
    <Link
      href={`/dashboard/requests/${request.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex gap-4">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb.url} alt="" className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-400">
            {request.customerName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{request.customerName}</p>
              <p className="truncate text-sm text-slate-500">{request.customerAddress}</p>
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-1">
              {quote && <span className="text-base font-bold text-slate-900">{formatCurrency(quote.total)}</span>}
              <StatusBadge status={request.status} label={REQUEST_STATUS_LABELS[request.status]} />
            </div>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{request.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>{timeAgo(request.createdAt)}</span>
            {quote?.scheduledDate && (
              <span className="font-medium text-green-700">Booked {formatDate(quote.scheduledDate)}</span>
            )}
            {needsReview && !quote?.aiFailedFallback && (
              <span className="font-medium text-brand-600">Draft ready — tap to review</span>
            )}
            {needsReview && quote?.aiFailedFallback && (
              <span className="font-medium text-amber-600">Needs manual quote</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
