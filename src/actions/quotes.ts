"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth-helpers";
import { sendSms } from "@/lib/sms/twilio";
import { sendEmail } from "@/lib/email/resend";
import { quoteEmailHtml } from "@/lib/email/templates";
import { calcTotals } from "@/lib/vat";
import { interpolate, formatCurrency } from "@/lib/utils";
import { countryOf } from "@/lib/countries";
import { DEFAULT_SMS_TEMPLATE_NEW_QUOTE } from "@/lib/constants";
import { lineItemSchema } from "@/lib/ai/schema";
import { z } from "zod";
import type { Business, Quote, Request as JobRequest } from "@prisma/client";

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

function parseLineItems(formData: FormData, vatRate: number) {
  const raw = String(formData.get("lineItems") ?? "[]");
  const parsed = lineItemsArraySchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error("Line items are invalid.");
  const { total } = calcTotals(parsed.data, vatRate);
  return { lineItems: parsed.data, total };
}

/** Texts (and emails, if we have an address) the customer their quote link. */
async function deliverQuote(business: Business, request: JobRequest, quote: Quote) {
  const { code: country } = countryOf(business.country);
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quote.acceptToken}`;
  const total = Number(quote.total);
  const smsBody = interpolate(business.smsTemplateNewQuote ?? DEFAULT_SMS_TEMPLATE_NEW_QUOTE, {
    customerName: request.customerName,
    businessName: business.name,
    total: formatCurrency(total),
    link,
  });

  await sendSms({ businessId: business.id, country, to: request.customerPhone, body: smsBody });
  if (request.customerEmail) {
    await sendEmail({
      to: request.customerEmail,
      subject: `Your quote from ${business.name} — ${formatCurrency(total)}`,
      html: quoteEmailHtml({
        businessName: business.name,
        customerName: request.customerName,
        summary: quote.summary,
        lineItems: lineItemsArraySchema.parse(quote.lineItems),
        vatRate: Number(quote.vatRate),
        total,
        estimatedHours: Number(quote.estimatedHours),
        link,
      }),
    });
  }
}

export async function saveQuoteEdits(formData: FormData): Promise<void> {
  const requestId = String(formData.get("requestId"));
  const { request } = await loadRequestForBusiness(requestId);
  const { lineItems, total } = parseLineItems(formData, Number(request.quote!.vatRate));
  const estimatedHours = Number(formData.get("estimatedHours") ?? request.quote!.estimatedHours);
  const summary = String(formData.get("summary") ?? request.quote!.summary);

  await prisma.quote.update({
    where: { requestId },
    data: { lineItems, total, estimatedHours, summary },
  });

  redirect(`/dashboard/requests/${requestId}?saved=1`);
}

export async function sendQuote(formData: FormData): Promise<void> {
  const requestId = String(formData.get("requestId"));
  const { business, request } = await loadRequestForBusiness(requestId);
  const { lineItems, total } = parseLineItems(formData, Number(request.quote!.vatRate));
  const estimatedHours = Number(formData.get("estimatedHours") ?? request.quote!.estimatedHours);
  const summary = String(formData.get("summary") ?? request.quote!.summary).trim();

  // Don't let a fallback/blank draft go out to a customer by accident.
  if (total <= 0) throw new Error("Add at least one priced line item before sending.");
  if (lineItems.some((li) => !li.description.trim())) throw new Error("Every line item needs a description.");
  if (!summary) throw new Error("Add a short message for the customer before sending.");

  const quote = await prisma.quote.update({
    where: { requestId },
    data: { lineItems, total, estimatedHours, summary, status: "SENT", sentAt: new Date() },
  });

  await prisma.request.update({ where: { id: requestId }, data: { status: "QUOTED" } });

  await deliverQuote(business, request, quote);

  redirect(`/dashboard/requests/${requestId}?sent=1`);
}

/** Re-sends the SMS/email for a quote that's already out (customer lost the text, etc.). */
export async function resendQuote(formData: FormData): Promise<void> {
  const requestId = String(formData.get("requestId"));
  const { business, request } = await loadRequestForBusiness(requestId);
  if (request.quote!.status !== "SENT") throw new Error("Only sent quotes can be re-sent.");

  await deliverQuote(business, request, request.quote!);

  redirect(`/dashboard/requests/${requestId}?resent=1`);
}
