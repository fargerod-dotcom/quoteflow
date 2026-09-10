import Link from "next/link";
import { format, isSameDay, isToday } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import type { CountryCode } from "@/lib/countries";
import type { Quote, Request as JobRequest } from "@prisma/client";

type Job = Quote & { request: JobRequest };

export function WeekView({ days, jobs, country }: { days: Date[]; jobs: Job[]; country: CountryCode }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
      {days.map((day) => {
        const dayJobs = jobs.filter((j) => j.scheduledDate && isSameDay(j.scheduledDate, day));
        const today = isToday(day);
        return (
          <div
            key={day.toISOString()}
            className={cn(
              "rounded-xl border bg-white p-3 sm:min-h-[9rem]",
              today ? "border-brand-300 ring-2 ring-brand-100" : "border-slate-200",
              dayJobs.length === 0 && "hidden sm:block"
            )}
          >
            <div className="flex items-baseline justify-between sm:block">
              <p className={cn("text-xs font-semibold uppercase tracking-wider", today ? "text-brand-600" : "text-slate-500")}>
                {format(day, "EEE")}
              </p>
              <p className={cn("text-lg font-bold sm:mt-0.5", today ? "text-brand-700" : "text-slate-900")}>
                {format(day, "d")}
                <span className="ml-1 text-xs font-medium text-slate-400 sm:hidden">{format(day, "MMM")}</span>
              </p>
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {dayJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/dashboard/requests/${job.requestId}`}
                  className="block rounded-lg border border-green-200 bg-green-50 px-2.5 py-2 text-xs hover:bg-green-100"
                >
                  <p className="font-semibold text-slate-900">{job.request.customerName}</p>
                  <p className="truncate text-slate-600">{job.request.customerAddress}</p>
                  <p className="mt-0.5 font-medium text-green-800">{formatCurrency(job.total, country)}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
