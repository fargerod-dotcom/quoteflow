"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import { generateUniqueSlug } from "@/lib/slug";
import { createCheckoutSession } from "@/lib/billing/stripe";
import { DEFAULT_CALLOUT_FEE, DEFAULT_HOURLY_RATE, TRIAL_DAYS } from "@/lib/constants";
import type { Trade } from "@prisma/client";

export async function createBusiness(formData: FormData): Promise<void> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const trade = String(formData.get("trade") ?? "OTHER") as Trade;
  const serviceArea = String(formData.get("serviceArea") ?? "").trim() || null;
  const ownerPhone = String(formData.get("ownerPhone") ?? "").trim();
  // Blank or garbage input falls back to typical Norwegian plumber rates.
  const hourlyRate = numberOr(formData.get("hourlyRate"), DEFAULT_HOURLY_RATE);
  const calloutFee = numberOr(formData.get("calloutFee"), DEFAULT_CALLOUT_FEE);

  if (!name || !ownerPhone) {
    throw new Error("Business name and phone number are required.");
  }

  const existing = await prisma.business.findUnique({ where: { userId: session.user.id } });
  if (existing) redirect("/dashboard/inbox");

  const slug = await generateUniqueSlug(name);
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

  const business = await prisma.business.create({
    data: {
      userId: session.user.id,
      name,
      slug,
      trade,
      serviceArea,
      ownerPhone,
      hourlyRate,
      calloutFee,
      trialEndsAt,
    },
  });

  const checkout = await createCheckoutSession({
    business,
    ownerEmail: session.user.email!,
  });

  redirect(checkout?.url ?? "/dashboard/inbox");
}

function numberOr(value: FormDataEntryValue | null, fallback: number): number {
  const n = Number(String(value ?? "").trim());
  return String(value ?? "").trim() === "" || !Number.isFinite(n) || n < 0 ? fallback : n;
}
