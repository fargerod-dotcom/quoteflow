import fs from "node:fs";
import path from "node:path";
import { interpolate } from "@/lib/utils";

let cachedTemplate: string | null = null;

function loadTemplate(): string {
  if (cachedTemplate) return cachedTemplate;
  const filePath = path.join(process.cwd(), "config", "quote-prompt.md");
  cachedTemplate = fs.readFileSync(filePath, "utf-8");
  return cachedTemplate;
}

export function buildQuotePrompt(input: {
  trade: string;
  hourlyRate: number;
  calloutFee: number;
  description: string;
  photoCount: number;
  /** From the country registry: what money and tax are called here, and the
   *  language to fall back to when the description is too short to tell. */
  currency: string;
  currencyName: string;
  taxLabel: string;
  language: string;
}): string {
  return interpolate(loadTemplate(), {
    trade: input.trade,
    hourlyRate: input.hourlyRate.toFixed(2),
    calloutFee: input.calloutFee.toFixed(2),
    description: input.description,
    photoCount: String(input.photoCount),
    currency: input.currency,
    currencyName: input.currencyName,
    taxLabel: input.taxLabel,
    language: input.language,
  });
}
