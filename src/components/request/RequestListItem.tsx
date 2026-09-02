import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";
import type { Quote, Request as JobRequest } from "@prisma/client";

type RequestWithQuote = JobRequest & { quote: Quote | null };

export function RequestListItem({ request }: { request: RequestWithQuote }) {
  return (
    <Link href={`/dashboard/requests/${request.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-slate-900">{request.customerName}</p>
            <p className="mt-0.5 text-sm text-slate-500">{request.customerAddress}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{request.description}</p>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
            <StatusBadge status={request.status} label={REQUEST_STATUS_LABELS[request.status]} />
            {request.quote && <span className="text-sm font-semibold text-slate-900">{formatCurrency(request.quote.total)}</span>}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">{formatDate(request.createdAt)}</p>
      </Card>
    </Link>
  );
}
