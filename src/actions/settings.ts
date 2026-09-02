"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";

export async function updatePrices(formData: FormData): Promise<void> {
  const business = await requireBusiness();
  const hourlyRate = Number(formData.get("hourlyRate") ?? 0);
  const calloutFee = Number(formData.get("calloutFee") ?? 0);
  const serviceArea = String(formData.get("serviceArea") ?? "").trim() || null;

  await prisma.business.update({
    where: { id: business.id },
    data: { hourlyRate, calloutFee, serviceArea },
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
