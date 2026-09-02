import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { RequestListItem } from "@/components/request/RequestListItem";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";
import type { RequestStatus } from "@prisma/client";

const TABS: RequestStatus[] = ["NEW", "QUOTED", "ACCEPTED", "DECLINED"];

export default async function InboxPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const business = await requireBusiness();
  const activeTab = (TABS.includes(searchParams.status as RequestStatus)
    ? searchParams.status
    : "NEW") as RequestStatus;

  const requests = await prisma.request.findMany({
    where: { businessId: business.id, status: activeTab },
    include: { quote: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Inbox</h1>
        <a
          href={`/r/${business.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          Your public link ↗
        </a>
      </div>

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <a
            key={tab}
            href={`/dashboard/inbox?status=${tab}`}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              activeTab === tab
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {REQUEST_STATUS_LABELS[tab]}
          </a>
        ))}
      </div>

      {requests.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No {REQUEST_STATUS_LABELS[activeTab].toLowerCase()} requests yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <RequestListItem key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
