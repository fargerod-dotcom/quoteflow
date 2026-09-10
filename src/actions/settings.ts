"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { toE164 } from "@/lib/phone";
import { isAllowedSmsDestination } from "@/lib/sms/policy";
import { countryOf } from "@/lib/countries";

export async function updatePrices(formData: FormData): Promise<void> {
  const business = await requireBusiness();
  const hourlyRate = Number(formData.get("hourlyRate") ?? 0);
  const calloutFee = Number(formData.get("calloutFee") ?? 0);
  const vatRate = Math.min(100, Math.max(0, Number(formData.get("vatRate") ?? 25)));
  const serviceArea = String(formData.get("serviceArea") ?? "").trim() || null;

  await prisma.business.update({
    where: { id: business.id },
    data: { hourlyRate, calloutFee, vatRate, serviceArea },
  });

  revalidatePath("/dashboard/settings");
}

export async function updateSmsTemplates(formData: FormData): Promise<void> {
  const business = await requireBusiness();

  await prisma.business.update({
    where: { id: business.id },
    data: {
      smsTemplateNewQuote: String(formData.get("smsTemplateNewQuote") ?? "").trim() || null,
      smsTemplateFollowUp: String(formData.get("smsTemplateFollowUp") ?? "").trim() || null,
      smsTemplateConfirmation: String(formData.get("smsTemplateConfirmation") ?? "").trim() || null,
    },
  });

  revalidatePath("/dashboard/settings");
}

export type OwnerPhoneState = { error: string | null; saved?: boolean };

/**
 * Form-state wrapper so a bad number renders inline instead of as Next's
 * generic error page — the same shape onboarding uses. The number is stored
 * normalised to E.164, and refused unless the SMS policy would deliver to it:
 * a wrong number here means the owner silently stops getting job alerts.
 */
export async function updateOwnerPhone(_prev: OwnerPhoneState, formData: FormData): Promise<OwnerPhoneState> {
  const business = await requireBusiness();
  const { code: country, name } = countryOf(business.country);
  const raw = String(formData.get("ownerPhone") ?? "").trim();

  const ownerPhone = toE164(raw, country);
  if (!ownerPhone || !isAllowedSmsDestination(ownerPhone, country)) {
    return { error: `That doesn't look like a mobile number in ${name} — new requests are texted to it.` };
  }

  await prisma.business.update({ where: { id: business.id }, data: { ownerPhone } });
  revalidatePath("/dashboard/settings");
  return { error: null, saved: true };
}
