import { cn, formatDate, timeAgo } from "@/lib/utils";
import type { CountryCode, Lang } from "@/lib/countries";
import type { Quote, Request as JobRequest } from "@prisma/client";

/** Horizontal Received → Quoted → Booked strip for the request detail page. */
export function StatusTimeline({
  request,
  quote,
  country,
  lang,
}: {
  request: JobRequest;
  quote: Quote;
  country: CountryCode;
  /** Owner-facing, so "en" for now. */
  lang: Lang;
}) {
  const declined = request.status === "DECLINED";
  const steps = [
    { label: "Received", done: true, when: timeAgo(request.createdAt, lang) },
    { label: "Quote sent", done: Boolean(quote.sentAt), when: quote.sentAt ? timeAgo(quote.sentAt, lang) : "Awaiting your review" },
    declined
      ? { label: "Declined", done: true, when: quote.respondedAt ? timeAgo(quote.respondedAt, lang) : "", bad: true }
      : {
          label: "Booked",
          done: quote.status === "ACCEPTED",
          when: quote.scheduledDate
            ? `For ${formatDate(quote.scheduledDate, country)}`
            : quote.sentAt
              ? `Waiting on customer${quote.followUpSentAt ? " · follow-up sent" : ""}`
              : "",
        },
  ];

  return (
    <ol className="grid grid-cols-3 gap-2">
      {steps.map((s, i) => (
        <li key={s.label} className="flex flex-col">
          <div className="flex items-center">
            <span
              className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                s.done
                  ? "bad" in s && s.bad
                    ? "bg-slate-700 text-white"
                    : "bg-green-600 text-white"
                  : "border-2 border-slate-300 bg-white text-slate-400"
              )}
            >
              {s.done ? "✓" : i + 1}
            </span>
            {i < steps.length - 1 && (
              <span className={cn("mx-1 h-0.5 flex-1", steps[i + 1].done ? "bg-green-600" : "bg-slate-200")} />
            )}
          </div>
          <p className={cn("mt-2 text-xs font-semibold", s.done ? "text-slate-900" : "text-slate-500")}>{s.label}</p>
          <p className="text-[11px] text-slate-400">{s.when}</p>
        </li>
      ))}
    </ol>
  );
}
