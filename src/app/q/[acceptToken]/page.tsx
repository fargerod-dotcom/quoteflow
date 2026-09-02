import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { QuoteSummary } from "@/components/quote/QuoteSummary";
import { DatePicker } from "@/components/quote/DatePicker";
import { QuoteActions } from "@/components/quote/QuoteActions";
import { formatDate, formatCurrency, googleCalendarHref, mapsHref } from "@/lib/utils";
import { lineItemSchema } from "@/lib/ai/schema";
import { z } from "zod";

export const metadata: Metadata = { title: "Your quote" };

function Shell({
  businessName,
  eyebrow,
  children,
}: {
  businessName: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 px-4 pb-14 pt-8 text-white">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold">{businessName}</h1>
        </div>
      </div>
      <div className="mx-auto -mt-8 max-w-lg px-4 pb-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">{children}</div>
      </div>
    </div>
  );
}

export default async function PublicQuotePage({ params }: { params: { acceptToken: string } }) {
  const quote = await prisma.quote.findUnique({
    where: { acceptToken: params.acceptToken },
    include: { request: { include: { business: true } } },
  });

  if (!quote) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Quote not found</h1>
        <p className="mt-2 text-sm text-slate-600">Check the link in your text message and try again.</p>
      </div>
    );
  }

  const { business, preferredDates } = quote.request;
  const lineItems = z.array(lineItemSchema).parse(quote.lineItems);

  if (quote.status === "ACCEPTED" && quote.scheduledDate) {
    const calendarHref = googleCalendarHref({
      title: `${business.name} — ${quote.request.description.slice(0, 60)}`,
      date: quote.scheduledDate,
      details: `Quoted total: ${formatCurrency(quote.total)}\n\n${quote.summary}`,
      location: quote.request.customerAddress,
    });
    return (
      <Shell businessName={business.name} eyebrow="Booking confirmed">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">You&rsquo;re booked!</h2>
          <p className="mt-1 text-sm text-slate-600">We&rsquo;ve texted you a confirmation.</p>
        </div>
        <dl className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
          <div className="flex justify-between px-4 py-3">
            <dt className="text-slate-500">Date</dt>
            <dd className="font-semibold text-slate-900">{formatDate(quote.scheduledDate)}</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-slate-500">Address</dt>
            <dd className="text-right font-semibold text-slate-900">
              <a href={mapsHref(quote.request.customerAddress)} target="_blank" rel="noreferrer" className="hover:underline">
                {quote.request.customerAddress}
              </a>
            </dd>
          </div>
          <div className="flex justify-between px-4 py-3">
            <dt className="text-slate-500">Quoted total</dt>
            <dd className="font-semibold text-slate-900">{formatCurrency(quote.total)}</dd>
          </div>
        </dl>
        <a
          href={calendarHref}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
          </svg>
          Add to Google Calendar
        </a>
        <p className="mt-4 text-center text-xs text-slate-500">
          Need to reschedule? Reply to the confirmation text.
        </p>
      </Shell>
    );
  }

  if (quote.status === "DECLINED") {
    return (
      <Shell businessName={business.name} eyebrow="Quote declined">
        <h2 className="text-xl font-bold text-slate-900">No problem.</h2>
        <p className="mt-2 text-sm text-slate-600">
          You&rsquo;ve declined this quote. If you change your mind, get in touch with {business.name} directly.
        </p>
      </Shell>
    );
  }

  if (quote.status !== "SENT") {
    return (
      <Shell businessName={business.name} eyebrow="Your quote">
        <h2 className="text-xl font-bold text-slate-900">This quote isn&rsquo;t ready yet</h2>
        <p className="mt-2 text-sm text-slate-600">You&rsquo;ll get a text as soon as it&rsquo;s sent.</p>
      </Shell>
    );
  }

  return (
    <Shell businessName={business.name} eyebrow={`Quote for ${quote.request.customerName}`}>
      <QuoteSummary
        lineItems={lineItems}
        total={Number(quote.total)}
        summary={quote.summary}
        estimatedHours={Number(quote.estimatedHours)}
      />

      <form className="mt-8 flex flex-col gap-6">
        <input type="hidden" name="acceptToken" value={quote.acceptToken} />
        <DatePicker dates={preferredDates} />
        <QuoteActions />
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        Job at {quote.request.customerAddress}. Accepting confirms the date — nothing is charged online.
      </p>
    </Shell>
  );
}
