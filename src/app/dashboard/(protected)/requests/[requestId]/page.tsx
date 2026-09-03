import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { saveQuoteEdits, sendQuote, resendQuote } from "@/actions/quotes";
import { PhotoGallery } from "@/components/request/PhotoGallery";
import { LineItemsEditor } from "@/components/request/LineItemsEditor";
import { ConfidenceBadge } from "@/components/request/ConfidenceBadge";
import { StatusTimeline } from "@/components/request/StatusTimeline";
import { QuoteSummary } from "@/components/quote/QuoteSummary";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { formatDate, mapsHref, telHref } from "@/lib/utils";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";
import { lineItemSchema } from "@/lib/ai/schema";
import { z } from "zod";

const FLASH: Record<string, string> = {
  saved: "Changes saved.",
  sent: "Quote sent — the customer has been texted the link.",
  resent: "Quote re-sent.",
};

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: { requestId: string };
  searchParams: Record<string, string | undefined>;
}) {
  const business = await requireBusiness();
  const request = await prisma.request.findUnique({
    where: { id: params.requestId },
    include: { photos: { orderBy: { order: "asc" } }, quote: true },
  });

  if (!request || request.businessId !== business.id || !request.quote) notFound();

  const quote = request.quote;
  const lineItems = z.array(lineItemSchema).parse(quote.lineItems);
  const isSent = quote.status !== "DRAFT";
  const acceptLink = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quote.acceptToken}`;
  const flashKey = Object.keys(FLASH).find((k) => searchParams[k]);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard/inbox" className="-mb-2 text-sm text-slate-500 hover:text-slate-900">
        ← Inbox
      </Link>

      {flashKey && (
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">{FLASH[flashKey]}</p>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{request.customerName}</h1>
            <p className="mt-0.5 text-xs text-slate-400">Submitted {formatDate(request.createdAt)}</p>
          </div>
          <StatusBadge status={request.status} label={REQUEST_STATUS_LABELS[request.status]} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={telHref(request.customerPhone)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            <PhoneIcon /> {request.customerPhone}
          </a>
          <a
            href={`sms:${request.customerPhone.replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            <ChatIcon /> Text
          </a>
          <a
            href={mapsHref(request.customerAddress)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            <PinIcon /> <span className="truncate">{request.customerAddress}</span>
          </a>
          {request.customerEmail && (
            <a
              href={`mailto:${request.customerEmail}`}
              className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              <MailIcon /> <span className="truncate">{request.customerEmail}</span>
            </a>
          )}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <StatusTimeline request={request} quote={quote} />
        </div>
      </div>

      {/* Job */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">The job</h2>
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">{request.description}</p>
        <div className="mt-4">
          <PhotoGallery photos={request.photos} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Customer&rsquo;s preferred dates: {request.preferredDates.map(formatDate).join(", ")}
        </p>
      </section>

      {/* Quote */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            {isSent ? "Quote" : "AI draft — review before sending"}
          </h2>
          {!isSent && <ConfidenceBadge confidence={quote.confidence} />}
        </div>

        {quote.aiFailedFallback && !isSent && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            The AI draft wasn&rsquo;t available for this request — fill in the quote manually below.
          </p>
        )}

        {isSent ? (
          <>
            <QuoteSummary
              lineItems={lineItems}
              vatRate={Number(quote.vatRate)}
              summary={quote.summary}
              estimatedHours={Number(quote.estimatedHours)}
            />
            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <CopyButton value={acceptLink} label="Copy customer link" />
              <a
                href={acceptLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                View as customer ↗
              </a>
              {quote.status === "SENT" && (
                <form action={resendQuote}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit" variant="ghost">
                    Re-send text
                  </Button>
                </form>
              )}
            </div>
          </>
        ) : (
          <form action={saveQuoteEdits} className="flex flex-col gap-5">
            <input type="hidden" name="requestId" value={request.id} />

            <LineItemsEditor initialLineItems={lineItems} vatRate={Number(quote.vatRate)} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedHours">Estimated hours</Label>
                <Input
                  id="estimatedHours"
                  name="estimatedHours"
                  type="number"
                  min="0"
                  step="0.25"
                  inputMode="decimal"
                  defaultValue={Number(quote.estimatedHours)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Message to customer</Label>
              <Textarea id="summary" name="summary" rows={3} defaultValue={quote.summary} />
              <p className="mt-1 text-xs text-slate-500">This is the first thing they read on the quote page.</p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="submit" variant="secondary" formAction={saveQuoteEdits}>
                Save draft
              </Button>
              <Button type="submit" formAction={sendQuote} size="lg">
                Send quote to {request.customerName.split(" ")[0]} →
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

const iconProps = { className: "h-4 w-4 text-slate-500", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
function PhoneIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg {...iconProps}>
      <path d="M21 12a8 8 0 01-11.6 7.1L4 21l1.9-4.6A8 8 0 1121 12z" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
