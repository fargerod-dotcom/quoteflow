import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { RequestListItem } from "@/components/request/RequestListItem";
import { ShareLinkCard } from "@/components/request/ShareLinkCard";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@prisma/client";

const TABS: RequestStatus[] = ["NEW", "QUOTED", "ACCEPTED", "DECLINED"];

const EMPTY_COPY: Record<RequestStatus, string> = {
  NEW: "No new requests. Share your link and they'll show up here — with an AI-drafted quote ready to go.",
  QUOTED: "Nothing waiting on customers. Quotes you've sent will sit here until they accept or decline.",
  ACCEPTED: "No booked jobs yet. Accepted quotes land here and on your calendar.",
  DECLINED: "No declined quotes. Nice.",
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const business = await requireBusiness();
  const activeTab = (TABS.includes(searchParams.status as RequestStatus)
    ? searchParams.status
    : "NEW") as RequestStatus;

  const [requests, counts, totalEver] = await Promise.all([
    prisma.request.findMany({
      where: { businessId: business.id, status: activeTab },
      include: { quote: true, photos: { orderBy: { order: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.request.groupBy({
      by: ["status"],
      where: { businessId: business.id },
      _count: { _all: true },
    }),
    prisma.request.count({ where: { businessId: business.id } }),
  ]);

  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all])) as Partial<
    Record<RequestStatus, number>
  >;

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${business.slug}`;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inbox</h1>
      </div>

      {totalEver === 0 && <ShareLinkCard url={publicUrl} prominent />}

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((tab) => {
          const n = countByStatus[tab] ?? 0;
          return (
            <a
              key={tab}
              href={`/dashboard/inbox?status=${tab}`}
              className={cn(
                "flex flex-shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium",
                activeTab === tab
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {REQUEST_STATUS_LABELS[tab]}
              {n > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    activeTab === tab ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {n}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
          <p className="mx-auto max-w-sm text-sm text-slate-500">{EMPTY_COPY[activeTab]}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <RequestListItem key={request.id} request={request} />
          ))}
        </div>
      )}

      {totalEver > 0 && (
        <div className="mt-8">
          <ShareLinkCard url={publicUrl} />
        </div>
      )}
    </div>
  );
}
