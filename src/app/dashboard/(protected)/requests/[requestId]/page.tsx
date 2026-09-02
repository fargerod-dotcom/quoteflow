import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { saveQuoteEdits, sendQuote } from "@/actions/quotes";
import { PhotoGallery } from "@/components/request/PhotoGallery";
import { LineItemsEditor } from "@/components/request/LineItemsEditor";
import { ConfidenceBadge } from "@/components/request/ConfidenceBadge";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { REQUEST_STATUS_LABELS } from "@/lib/constants";
import { lineItemSchema } from "@/lib/ai/schema";
import { z } from "zod";

export default async function RequestDetailPage({ params }: { params: { requestId: string } }) {
  const business = await requireBusiness();
  const request = await prisma.request.findUnique({
    where: { id: params.requestId },
    include: { photos: { orderBy: { order: "asc" } }, quote: true },
  });

  if (!request || request.businessId !== business.id || !request.quote) notFound();

  const quote = request.quote;
  const lineItems = z.array(lineItemSchema).parse(quote.lineItems);
  const isSent = quote.status !== "DRAFT";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">{request.customerName}</h1>
          <StatusBadge status={request.status} label={REQUEST_STATUS_LABELS[request.status]} />
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {request.customerAddress} · {request.customerPhone}
          {request.customerEmail ? ` · ${request.customerEmail}` : ""}
        </p>
        <p className="text-xs text-slate-400">Submitted {formatDate(request.createdAt)}</p>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Job description</h2>
        <p className="whitespace-pre-wrap text-sm text-slate-800">{request.description}</p>
        <div className="mt-3">
          <PhotoGallery photos={request.photos} />
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">AI-drafted quote</h2>
          <ConfidenceBadge confidence={quote.confidence} />
        </div>
        {quote.aiFailedFallback && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            The AI draft wasn&rsquo;t available for this request — fill in the quote manually below.
          </p>
        )}

        <form action={isSent ? undefined : saveQuoteEdits} className="flex flex-col gap-4">
          <input type="hidden" name="requestId" value={request.id} />

          <LineItemsEditor initialLineItems={lineItems} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedHours">Estimated hours</Label>
              <Input
                id="estimatedHours"
                name="estimatedHours"
                type="number"
                min="0"
                step="0.25"
                defaultValue={Number(quote.estimatedHours)}
                disabled={isSent}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="summary">Summary for customer</Label>
            <Textarea id="summary" name="summary" rows={3} defaultValue={quote.summary} disabled={isSent} />
          </div>

          {!isSent && (
            <div className="flex gap-3">
              <Button type="submit" variant="secondary" formAction={saveQuoteEdits}>
                Save changes
              </Button>
              <Button type="submit" formAction={sendQuote}>
                Send to customer
              </Button>
            </div>
          )}
        </form>

        {isSent && (
          <p className="mt-2 text-sm text-slate-500">
            This quote has already been sent and can no longer be edited.
          </p>
        )}
      </section>
    </div>
  );
}
