import Link from "next/link";
import { addWeeks, endOfWeek, format, startOfWeek, eachDayOfInterval, isSameWeek } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { WeekView } from "@/components/calendar/WeekView";
import { formatCurrency } from "@/lib/utils";

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
  const thisWeek = isSameWeek(anchor, new Date(), { weekStartsOn: 1 });

  const jobs = await prisma.quote.findMany({
    where: {
      status: "ACCEPTED",
      scheduledDate: { gte: weekStart, lte: weekEnd },
      request: { businessId: business.id },
    },
    include: { request: true },
    orderBy: { scheduledDate: "asc" },
  });

  const weekTotal = jobs.reduce((sum, j) => sum + Number(j.total), 0);
  const prevWeek = addWeeks(weekStart, -1).toISOString();
  const nextWeek = addWeeks(weekStart, 1).toISOString();
  const navClass = "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendar</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d")}
            {jobs.length > 0 && (
              <>
                {" · "}
                <span className="font-medium text-slate-700">
                  {jobs.length} job{jobs.length === 1 ? "" : "s"}, {formatCurrency(weekTotal)}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/calendar?week=${encodeURIComponent(prevWeek)}`} className={navClass}>
            ←
          </Link>
          {!thisWeek && (
            <Link href="/dashboard/calendar" className={navClass}>
              Today
            </Link>
          )}
          <Link href={`/dashboard/calendar?week=${encodeURIComponent(nextWeek)}`} className={navClass}>
            →
          </Link>
        </div>
      </div>

      {jobs.length === 0 && (
        <p className="mb-3 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500 sm:hidden">
          Nothing booked this week.
        </p>
      )}
      <WeekView days={days} jobs={jobs} />
    </div>
  );
}
