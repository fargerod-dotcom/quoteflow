"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { sendSms } from "@/lib/sms/twilio";
import { sendEmail } from "@/lib/email/resend";
import { interpolate, formatCurrency } from "@/lib/utils";
import { DEFAULT_SMS_TEMPLATE_NEW_QUOTE } from "@/lib/constants";
import { lineItemSchema } from "@/lib/ai/schema";
import { z } from "zod";

const lineItemsArraySchema = z.array(lineItemSchema).min(1);

async function loadRequestForBusiness(requestId: string) {
  const business = await requireBusiness();
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: { quote: true },
  });
  if (!request || request.businessId !== business.id || !request.quote) {
    throw new Error("Request not found.");
  }
  return { business, request };
}

function parseLineItems(formData: FormData) {
  const raw = String(formData.get("lineItems") ?? "[]");
  const parsed = lineItemsArraySchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("Line items are invalid.");
  const total = parsed.data.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  return { lineItems: parsed.data, total };
}

export async function saveQuoteEdits(formData: FormData): Promise<void> {
  const requestId = String(formData.get("requestId"));
  const { request } = await loadRequestForBusiness(requestId);
  const { lineItems, total } = parseLineItems(formData);
  const estimatedHours = Number(formData.get("estimatedHours") ?? request.quote!.estimatedHours);
  const summary = String(formData.get("summary") ?? request.quote!.summary);

  await prisma.quote.update({
    where: { requestId },
    data: { lineItems, total, estimatedHours, summary },
  });

  redirect(`/dashboard/requests/${requestId}`);
}

export async function sendQuote(formData: FormData): Promise<void> {
  const requestId = String(formData.get("requestId"));
  const { business, request } = await loadRequestForBusiness(requestId);
  const { lineItems, total } = parseLineItems(formData);
  const estimatedHours = Number(formData.get("estimatedHours") ?? request.quote!.estimatedHours);
  const summary = String(formData.get("summary") ?? request.quote!.summary);

  const quote = await prisma.quote.update({
    where: { requestId },
    data: { lineItems, total, estimatedHours, summary, status: "SENT", sentAt: new Date() },
  });

  await prisma.request.update({ where: { id: requestId }, data: { status: "QUOTED" } });

  const link = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quote.acceptToken}`;
  const smsBody = interpolate(business.smsTemplateNewQuote ?? DEFAULT_SMS_TEMPLATE_NEW_QUOTE, {
    customerName: request.customerName,
    businessName: business.name,
    total: formatCurrency(total),
    link,
  });

  await sendSms({ to: request.customerPhone, body: smsBody });
  if (request.customerEmail) {
    await sendEmail({
      to: request.customerEmail,
      subject: `Your quote from ${business.name}`,
      html: `<p>${smsBody.replace(link, `<a href="${link}">${link}</a>`)}</p>`,
    });
  }

  redirect(`/dashboard/requests/${requestId}`);
}
