import Anthropic from "@anthropic-ai/sdk";
import { buildQuotePrompt } from "@/lib/ai/prompt";
import { parseQuoteResponse, type QuoteDraft } from "@/lib/ai/schema";
import { logError } from "@/lib/errors";

const MODEL = "claude-opus-5";

export type PhotoInput = {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
};

export type DraftQuoteInput = {
  trade: string;
  hourlyRate: number;
  calloutFee: number;
  description: string;
  photos: PhotoInput[];
  requestId?: string;
};

export type DraftQuoteResult = {
  draft: QuoteDraft;
  raw: unknown;
  failedFallback: boolean;
};

function placeholderDraft(reason: string): QuoteDraft {
  return {
    lineItems: [{ description: `Manual review needed (${reason})`, quantity: 1, unitPrice: 0 }],
    estimatedHours: 0,
    total: 0,
    summary: "AI draft unavailable — please review this request and fill in the quote manually.",
    confidence: "low",
  };
}

/**
 * Drafts a quote from a job description + photos via Claude. Fails soft:
 * a missing API key, an API error, or a response that doesn't validate all
 * result in a placeholder low-confidence draft rather than a thrown error,
 * so request creation always succeeds.
 */
export async function draftQuote(input: DraftQuoteInput): Promise<DraftQuoteResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    await logError("ai.claude", "ANTHROPIC_API_KEY not set — returning placeholder draft", {
      requestId: input.requestId,
    });
    return { draft: placeholderDraft("no API key configured"), raw: null, failedFallback: true };
  }

  const client = new Anthropic();
  const prompt = buildQuotePrompt({
    trade: input.trade,
    hourlyRate: input.hourlyRate,
    calloutFee: input.calloutFee,
    description: input.description,
    photoCount: input.photos.length,
  });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1536,
      messages: [
        {
          role: "user",
          content: [
            ...input.photos.slice(0, 5).map((photo) => ({
              type: "image" as const,
              source: { type: "base64" as const, media_type: photo.mediaType, data: photo.base64 },
            })),
            { type: "text" as const, text: prompt },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const rawText = textBlock && textBlock.type === "text" ? textBlock.text : "";

    const parsed = parseQuoteResponse(rawText);
    if (!parsed.ok) {
      await logError("ai.claude", `Failed to parse Claude response: ${parsed.error}`, {
        requestId: input.requestId,
        rawText,
      });
      return { draft: placeholderDraft("AI response could not be parsed"), raw: rawText, failedFallback: true };
    }

    return { draft: parsed.draft, raw: rawText, failedFallback: false };
  } catch (err) {
    await logError("ai.claude", err instanceof Error ? err.message : "Unknown Claude API error", {
      requestId: input.requestId,
    });
    return { draft: placeholderDraft("AI request failed"), raw: null, failedFallback: true };
  }
}
