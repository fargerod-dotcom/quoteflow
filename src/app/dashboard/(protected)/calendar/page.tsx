import Link from "next/link";
import { addWeeks, endOfWeek, format, startOfWeek, eachDayOfInterval } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { WeekView } from "@/components/calendar/WeekView";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { week?: string };
}) {
  const business = await requireBusiness();

  const anchor = searchParams.week ? new Date(searchParams.week) : new Date();
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const jobs = await prisma.quote.findMany({
    where: {
      status: "ACCEPTED",
      scheduledDate: { gte: weekStart, lte: weekEnd },
      request: { businessId: business.id },
    },
    include: { request: true },
    orderBy: { scheduledDate: "asc" },
  });

  const prevWeek = addWeeks(weekStart, -1).toISOString();
  const nextWeek = addWeeks(weekStart, 1).toISOString();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          Calendar — {format(weekStart, "MMM d")} to {format(weekEnd, "MMM d")}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/calendar?week=${encodeURIComponent(prevWeek)}`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            ← Prev
          </Link>
          <Link
            href={`/dashboard/calendar?week=${encodeURIComponent(nextWeek)}`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Next →
          </Link>
        </div>
      </div>
      <WeekView days={days} jobs={jobs} />
    </div>
  );
}
