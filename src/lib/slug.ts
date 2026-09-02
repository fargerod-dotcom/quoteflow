import { prisma } from "@/lib/prisma";

// Strips Unicode combining diacritical marks (U+0300-U+036F) left behind
// after NFKD normalization, e.g. turning "e-with-accent" into plain "e".
const COMBINING_MARKS = new RegExp("[̀-ͯ]", "g");

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base.length > 0 ? base : `business-${Date.now()}`;
}

/**
 * Generates a URL slug for a business's public intake link, appending
 * -2, -3, ... on collision with an existing business.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (await prisma.business.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
