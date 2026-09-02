import { z } from "zod";

export const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

export const quoteDraftSchema = z.object({
  lineItems: z.array(lineItemSchema).min(1),
  estimatedHours: z.number().nonnegative(),
  total: z.number().nonnegative(),
  summary: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]),
});

export type LineItem = z.infer<typeof lineItemSchema>;
export type QuoteDraft = z.infer<typeof quoteDraftSchema>;

export type ParseResult =
  | { ok: true; draft: QuoteDraft }
  | { ok: false; error: string };

/**
 * Defensively parses a raw LLM text response into a validated QuoteDraft.
 * Never throws: malformed JSON or a schema mismatch both come back as
 * { ok: false, error } so callers can fall back to a placeholder quote.
 */
export function parseQuoteResponse(rawText: string): ParseResult {
  const attempts = [rawText, rawText.replace(/```json|```/g, "").trim()];

  let lastError = "Response was not valid JSON";
  for (const attempt of attempts) {
    let json: unknown;
    try {
      json = JSON.parse(attempt);
    } catch {
      continue;
    }

    const result = quoteDraftSchema.safeParse(json);
    if (result.success) {
      return { ok: true, draft: result.data };
    }
    lastError = result.error.message;
  }

  return { ok: false, error: lastError };
}
