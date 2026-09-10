"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms/twilio";
import { sendEmail } from "@/lib/email/resend";
import { bookingConfirmedEmailHtml } from "@/lib/email/templates";
import { interpolate, formatDate, formatCurrency, googleCalendarHref } from "@/lib/utils";
import { countryOf } from "@/lib/countries";
import { t } from "@/lib/i18n";

async function loadSentQuote(acceptToken: string) {
  const quote = await prisma.quote.findUnique({
    where: { acceptToken },
    include: { request: { include: { business: true } } },
  });
  if (!quote || quote.status !== "SENT") {
    // The customer sees this one, so it speaks the business's language when we
    // have a business, and the default country's otherwise.
    throw new Error(t("error.quoteUnavailable", countryOf(quote?.request.business.country).lang));
  }
  return quote;
}

export async function acceptQuote(formData: FormData): Promise<void> {
  const acceptToken = String(formData.get("acceptToken"));
  const scheduledDateRaw = String(formData.get("scheduledDate") ?? "");
  const quote = await loadSentQuote(acceptToken);

  const { code: country, lang } = countryOf(quote.request.business.country);
  if (!scheduledDateRaw) throw new Error(t("error.pickDate", lang));
  const scheduledDate = new Date(scheduledDateRaw);

  await prisma.quote.update({
    where: { acceptToken },
    data: { status: "ACCEPTED", respondedAt: new Date(), scheduledDate },
  });
  await prisma.request.update({ where: { id: quote.requestId }, data: { status: "ACCEPTED" } });

  const business = quote.request.business;
  const confirmationBody = interpolate(business.smsTemplateConfirmation ?? t("sms.confirmation", lang), {
    businessName: business.name,
    scheduledDate: formatDate(scheduledDate, country),
  });

  await sendSms({ businessId: business.id, country, to: quote.request.customerPhone, body: confirmationBody });
  await sendSms({
    businessId: business.id,
    country,
    to: business.ownerPhone,
    body: `✅ ${quote.request.customerName} accepted ${formatCurrency(quote.total, country)} for ${formatDate(scheduledDate, country)} — ${quote.request.customerAddress}. ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar`,
  });
  if (quote.request.customerEmail) {
    await sendEmail({
      to: quote.request.customerEmail,
      subject: t("email.bookedSubject", lang, { business: business.name, date: formatDate(scheduledDate, country) }),
      html: bookingConfirmedEmailHtml({
        country,
        lang,
        businessName: business.name,
        customerName: quote.request.customerName,
        scheduledDate,
        total: Number(quote.total),
        address: quote.request.customerAddress,
        calendarLink: googleCalendarHref({
          title: `${business.name} — ${quote.request.description.slice(0, 60)}`,
          date: scheduledDate,
          details: `${t("quote.quotedTotal", lang)}: ${formatCurrency(quote.total, country)}\n\n${quote.summary}`,
          location: quote.request.customerAddress,
        }),
      }),
    });
  }

  redirect(`/q/${acceptToken}`);
}

export async function declineQuote(formData: FormData): Promise<void> {
  const acceptToken = String(formData.get("acceptToken"));
  const quote = await loadSentQuote(acceptToken);

  await prisma.quote.update({
    where: { acceptToken },
    data: { status: "DECLINED", respondedAt: new Date() },
  });
  await prisma.request.update({ where: { id: quote.requestId }, data: { status: "DECLINED" } });

  const { code: declinedCountry } = countryOf(quote.request.business.country);
  await sendSms({
    businessId: quote.request.business.id,
    country: declinedCountry,
    to: quote.request.business.ownerPhone,
    body: `${quote.request.customerName} declined the ${formatCurrency(quote.total, declinedCountry)} quote (${quote.request.customerAddress}). ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/requests/${quote.requestId}`,
  });

  redirect(`/q/${acceptToken}`);
}
