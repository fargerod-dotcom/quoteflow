import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { QuoteSummary } from "@/components/quote/QuoteSummary";
import { DatePicker } from "@/components/quote/DatePicker";
import { QuoteActions } from "@/components/quote/QuoteActions";
import { formatDate, formatCurrency, googleCalendarHref, mapsHref } from "@/lib/utils";
import { countryOf, DEFAULT_COUNTRY, type CountryCode, type Lang } from "@/lib/countries";
import { t } from "@/lib/i18n";
import { lineItemSchema } from "@/lib/ai/schema";
import { z } from "zod";

// Static, so it uses the default country's language: making the tab title
// per-business would cost a second query on every customer page load. Revisit
// when the country selector lands and businesses are not all Norwegian.
export const metadata: Metadata = { title: t("quote.metaTitle", countryOf(DEFAULT_COUNTRY).lang) };

function Shell({
  businessName,
  eyebrow,
  lang,
  children,
}: {
  businessName: string;
  eyebrow: string;
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <div lang={lang} className="min-h-screen bg-slate-50">
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
    const lang: Lang = countryOf(DEFAULT_COUNTRY).lang;
    return (
      <div lang={lang} className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">{t("quote.notFoundTitle", lang)}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("quote.notFoundBody", lang)}</p>
      </div>
    );
  }

  const { business, preferredDates } = quote.request;
  // Page chrome follows the business's country; the money follows it too, and
  // quote.currency is the snapshot of what it was priced in.
  const { code: country, lang }: { code: CountryCode; lang: Lang } = countryOf(business.country);
  const lineItems = z.array(lineItemSchema).parse(quote.lineItems);

  if (quote.status === "ACCEPTED" && quote.scheduledDate) {
    const calendarHref = googleCalendarHref({
      title: `${business.name} — ${quote.request.description.slice(0, 60)}`,
      date: quote.scheduledDate,
      details: `${t("quote.quotedTotal", lang)}: ${formatCurrency(quote.total, country)}\n\n${quote.summary}`,
      location: quote.request.customerAddress,
    });
    return (
      <Shell lang={lang} businessName={business.name} eyebrow={t("quote.eyebrowBooked", lang)}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">{t("quote.bookedTitle", lang)}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("quote.bookedBody", lang)}</p>
        </div>
        <dl className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
          <div className="flex justify-between px-4 py-3">
            <dt className="text-slate-500">{t("quote.dateLabel", lang)}</dt>
            <dd className="font-semibold text-slate-900">{formatDate(quote.scheduledDate, country)}</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-slate-500">{t("quote.addressLabel", lang)}</dt>
            <dd className="text-right font-semibold text-slate-900">
              <a href={mapsHref(quote.request.customerAddress)} target="_blank" rel="noreferrer" className="hover:underline">
                {quote.request.customerAddress}
              </a>
            </dd>
          </div>
          <div className="flex justify-between px-4 py-3">
            <dt className="text-slate-500">{t("quote.quotedTotal", lang)}</dt>
            <dd className="font-semibold text-slate-900">{formatCurrency(quote.total, country)}</dd>
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
          {t("quote.addToCalendar", lang)}
        </a>
        <p className="mt-4 text-center text-xs text-slate-500">{t("quote.rescheduleNote", lang)}</p>
      </Shell>
    );
  }

  if (quote.status === "DECLINED") {
    return (
      <Shell lang={lang} businessName={business.name} eyebrow={t("quote.eyebrowDeclined", lang)}>
        <h2 className="text-xl font-bold text-slate-900">{t("quote.declinedTitle", lang)}</h2>
        <p className="mt-2 text-sm text-slate-600">{t("quote.declinedBody", lang, { business: business.name })}</p>
      </Shell>
    );
  }

  if (quote.status !== "SENT") {
    return (
      <Shell lang={lang} businessName={business.name} eyebrow={t("quote.eyebrowYours", lang)}>
        <h2 className="text-xl font-bold text-slate-900">{t("quote.notReadyTitle", lang)}</h2>
        <p className="mt-2 text-sm text-slate-600">{t("quote.notReadyBody", lang)}</p>
      </Shell>
    );
  }

  return (
    <Shell lang={lang} businessName={business.name} eyebrow={t("quote.eyebrowFor", lang, { name: quote.request.customerName })}>
      <QuoteSummary
        lineItems={lineItems}
        vatRate={Number(quote.vatRate)}
        summary={quote.summary}
        estimatedHours={Number(quote.estimatedHours)}
        country={country}
        lang={lang}
      />

      <form className="mt-8 flex flex-col gap-6">
        <input type="hidden" name="acceptToken" value={quote.acceptToken} />
        <DatePicker dates={preferredDates} country={country} lang={lang} />
        <QuoteActions lang={lang} />
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        {t("quote.jobAtNote", lang, { address: quote.request.customerAddress })}
      </p>
    </Shell>
  );
}
