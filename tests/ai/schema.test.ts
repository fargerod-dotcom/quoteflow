import { describe, it, expect } from "vitest";
import { parseQuoteResponse } from "@/lib/ai/schema";

const VALID = {
  lineItems: [{ description: "Call-out fee", quantity: 1, unitPrice: 49 }],
  estimatedHours: 1.5,
  total: 49,
  summary: "Straightforward faucet repair.",
  confidence: "high",
};

describe("parseQuoteResponse", () => {
  it("parses a valid JSON response", () => {
    const result = parseQuoteResponse(JSON.stringify(VALID));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.total).toBe(49);
      expect(result.draft.confidence).toBe("high");
    }
  });

  it("parses a response wrapped in markdown code fences", () => {
    const result = parseQuoteResponse("```json\n" + JSON.stringify(VALID) + "\n```");
    expect(result.ok).toBe(true);
  });

  it("rejects malformed JSON without throwing", () => {
    expect(() => parseQuoteResponse("{not valid json")).not.toThrow();
    const result = parseQuoteResponse("{not valid json");
    expect(result.ok).toBe(false);
  });

  it("rejects a response missing required fields", () => {
    const { total, ...missingTotal } = VALID;
    const result = parseQuoteResponse(JSON.stringify(missingTotal));
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid confidence value", () => {
    const result = parseQuoteResponse(JSON.stringify({ ...VALID, confidence: "extreme" }));
    expect(result.ok).toBe(false);
  });

  it("rejects a negative unit price", () => {
    const result = parseQuoteResponse(
      JSON.stringify({ ...VALID, lineItems: [{ description: "x", quantity: 1, unitPrice: -10 }] })
    );
    expect(result.ok).toBe(false);
  });

  it("rejects an empty lineItems array", () => {
    const result = parseQuoteResponse(JSON.stringify({ ...VALID, lineItems: [] }));
    expect(result.ok).toBe(false);
  });
});
