"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { toE164 } from "@/lib/phone";
import { isAllowedSmsDestination } from "@/lib/sms/policy";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import { generateUniqueSlug } from "@/lib/slug";
import { createCheckoutSession } from "@/lib/billing/stripe";
import { TRIAL_DAYS } from "@/lib/constants";
import { countryOf, DEFAULT_COUNTRY } from "@/lib/countries";
import type { Trade } from "@prisma/client";

export type OnboardingState = { error: string | null };

/** Form-state wrapper: surfaces validation errors inline; redirects pass through. */
export async function submitBusiness(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  try {
    await createBusiness(formData);
    return { error: null };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: err instanceof Error ? err.message : "Something went wrong. Please try again." };
  }
}

export async function createBusiness(formData: FormData): Promise<void> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const trade = String(formData.get("trade") ?? "OTHER") as Trade;
  const serviceArea = String(formData.get("serviceArea") ?? "").trim() || null;
  const ownerPhoneRaw = String(formData.get("ownerPhone") ?? "").trim();
  // No selector at launch: the form posts a hidden "NO". countryOf() keeps a
  // garbage value from turning into a business that cannot be priced.
  const { code: country, defaults, tax } = countryOf(String(formData.get("country") ?? DEFAULT_COUNTRY));
  // Blank or garbage input falls back to the registry's rates for the country.
  const hourlyRate = numberOr(formData.get("hourlyRate"), defaults.hourlyRate);
  const calloutFee = numberOr(formData.get("calloutFee"), defaults.calloutFee);

  if (!name || !ownerPhoneRaw) {
    throw new Error("Business name and phone number are required.");
  }
  // Stored normalised so every SMS goes to a number the policy will actually deliver to.
  const ownerPhone = toE164(ownerPhoneRaw, country);
  if (!ownerPhone || !isAllowedSmsDestination(ownerPhone, country)) {
    throw new Error("Please enter a Norwegian mobile number (8 digits starting with 4 or 9) — that's where new requests are texted.");
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
      country,
      ownerPhone,
      hourlyRate,
      calloutFee,
      vatRate: tax.defaultRate,
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
