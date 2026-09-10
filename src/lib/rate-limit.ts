import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Abuse limits on the public intake form. Each submission costs the business
 * an SMS and a Claude call, so a bot hammering one link is real money.
 * Counts are taken from the Request table itself — no extra store needed.
 */
export const IP_LIMITS = { perHour: 3, perDay: 10 };
export const SLUG_LIMITS = { perHour: 20, perDay: 60 };

/** The customer-facing wording lives in the dictionary as error.rateLimit. */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Salted SHA-256 of the client IP — enough to rate-limit, not enough to identify. */
export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? "quoteflow"}:${ip}`)
    .digest("hex");
}

/** Client IP from the proxy headers Railway/Vercel set; null when unknown (e.g. tests). */
export function clientIpHash(): string | null {
  try {
    const h = headers();
    const raw = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
    return raw ? hashIp(raw) : null;
  } catch {
    return null;
  }
}

async function countSince(where: { businessId?: string; ipHash?: string }, since: Date): Promise<number> {
  return prisma.request.count({ where: { ...where, createdAt: { gte: since } } });
}

/** True when another intake submission is allowed for this IP and link. */
export async function intakeAllowed(businessId: string, ipHash: string | null): Promise<boolean> {
  const now = Date.now();
  const hourAgo = new Date(now - HOUR);
  const dayAgo = new Date(now - DAY);

  const [slugHour, slugDay] = await Promise.all([
    countSince({ businessId }, hourAgo),
    countSince({ businessId }, dayAgo),
  ]);
  if (slugHour >= SLUG_LIMITS.perHour || slugDay >= SLUG_LIMITS.perDay) return false;

  if (!ipHash) return true;
  const [ipHour, ipDay] = await Promise.all([countSince({ ipHash }, hourAgo), countSince({ ipHash }, dayAgo)]);
  return ipHour < IP_LIMITS.perHour && ipDay < IP_LIMITS.perDay;
}
