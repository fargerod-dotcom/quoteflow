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
}): string {
  return interpolate(loadTemplate(), {
    trade: input.trade,
    hourlyRate: input.hourlyRate.toFixed(2),
    calloutFee: input.calloutFee.toFixed(2),
    description: input.description,
    photoCount: String(input.photoCount),
  });
}
