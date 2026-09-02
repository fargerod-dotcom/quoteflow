import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import type { Quote, Request as JobRequest } from "@prisma/client";

type Job = Quote & { request: JobRequest };

export function WeekView({ days, jobs }: { days: Date[]; jobs: Job[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {days.map((day) => {
        const dayJobs = jobs.filter((j) => j.scheduledDate && isSameDay(j.scheduledDate, day));
        return (
          <div key={day.toISOString()} className="rounded-lg border border-slate-200 bg-white p-2">
            <p className="text-xs font-semibold text-slate-500">{format(day, "EEE MMM d")}</p>
            <div className="mt-2 flex flex-col gap-2">
              {dayJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/dashboard/requests/${job.requestId}`}
                  className="block rounded-md bg-brand-50 px-2 py-1.5 text-xs hover:bg-brand-100"
                >
                  <p className="font-medium text-slate-900">{job.request.customerName}</p>
                  <p className="text-slate-600">{formatCurrency(job.total)}</p>
                </Link>
              ))}
              {dayJobs.length === 0 && <p className="text-xs text-slate-300">—</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
