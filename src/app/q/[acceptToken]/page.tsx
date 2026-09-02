import { prisma } from "@/lib/prisma";
import { acceptQuote, declineQuote } from "@/actions/public-quote";
import { QuoteSummary } from "@/components/quote/QuoteSummary";
import { DatePicker } from "@/components/quote/DatePicker";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { lineItemSchema } from "@/lib/ai/schema";
import { z } from "zod";

export default async function PublicQuotePage({ params }: { params: { acceptToken: string } }) {
  const quote = await prisma.quote.findUnique({
    where: { acceptToken: params.acceptToken },
    include: { request: { include: { business: true } } },
  });

  if (!quote) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Quote not found</h1>
      </div>
    );
  }

  const { business, preferredDates } = quote.request;
  const lineItems = z.array(lineItemSchema).parse(quote.lineItems);

  if (quote.status === "ACCEPTED") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">You&rsquo;re booked!</h1>
        <p className="mt-2 text-sm text-slate-600">
          {business.name} will see you on {quote.scheduledDate ? formatDate(quote.scheduledDate) : "the scheduled date"}.
        </p>
      </div>
    );
  }

  if (quote.status === "DECLINED") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Quote declined</h1>
        <p className="mt-2 text-sm text-slate-600">
          No problem — reach out to {business.name} directly if you change your mind.
        </p>
      </div>
    );
  }

  if (quote.status !== "SENT") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">This quote isn&rsquo;t ready yet</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Your quote from {business.name}</h1>
      <div className="mt-6">
        <QuoteSummary lineItems={lineItems} total={Number(quote.total)} summary={quote.summary} />
      </div>

      <form className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="acceptToken" value={quote.acceptToken} />
        <DatePicker dates={preferredDates} />
        <div className="flex gap-3">
          <Button type="submit" formAction={declineQuote} variant="secondary">
            Decline
          </Button>
          <Button type="submit" formAction={acceptQuote}>
            Accept & book
          </Button>
        </div>
      </form>
    </div>
  );
}
