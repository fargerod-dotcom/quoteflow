"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms/twilio";
import { sendEmail } from "@/lib/email/resend";
import { bookingConfirmedEmailHtml } from "@/lib/email/templates";
import { interpolate, formatDate, formatCurrency, googleCalendarHref } from "@/lib/utils";
import { DEFAULT_SMS_TEMPLATE_CONFIRMATION } from "@/lib/constants";

async function loadSentQuote(acceptToken: string) {
  const quote = await prisma.quote.findUnique({
    where: { acceptToken },
    include: { request: { include: { business: true } } },
  });
  if (!quote || quote.status !== "SENT") throw new Error("This quote is no longer available.");
  return quote;
}

export async function acceptQuote(formData: FormData): Promise<void> {
  const acceptToken = String(formData.get("acceptToken"));
  const scheduledDateRaw = String(formData.get("scheduledDate") ?? "");
  const quote = await loadSentQuote(acceptToken);

  if (!scheduledDateRaw) throw new Error("Please pick a date.");
  const scheduledDate = new Date(scheduledDateRaw);

  await prisma.quote.update({
    where: { acceptToken },
    data: { status: "ACCEPTED", respondedAt: new Date(), scheduledDate },
  });
  await prisma.request.update({ where: { id: quote.requestId }, data: { status: "ACCEPTED" } });

  const business = quote.request.business;
  const confirmationBody = interpolate(
    business.smsTemplateConfirmation ?? DEFAULT_SMS_TEMPLATE_CONFIRMATION,
    { businessName: business.name, scheduledDate: formatDate(scheduledDate) }
  );

  await sendSms({ to: quote.request.customerPhone, body: confirmationBody });
  await sendSms({
    to: business.ownerPhone,
    body: `✅ ${quote.request.customerName} accepted ${formatCurrency(quote.total)} for ${formatDate(scheduledDate)} — ${quote.request.customerAddress}. ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/calendar`,
  });
  if (quote.request.customerEmail) {
    await sendEmail({
      to: quote.request.customerEmail,
      subject: `Booking confirmed with ${business.name} — ${formatDate(scheduledDate)}`,
      html: bookingConfirmedEmailHtml({
        businessName: business.name,
        customerName: quote.request.customerName,
        scheduledDate,
        total: Number(quote.total),
        address: quote.request.customerAddress,
        calendarLink: googleCalendarHref({
          title: `${business.name} — ${quote.request.description.slice(0, 60)}`,
          date: scheduledDate,
          details: `Quoted total: ${formatCurrency(quote.total)}\n\n${quote.summary}`,
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

  await sendSms({
    to: quote.request.business.ownerPhone,
    body: `${quote.request.customerName} declined the ${formatCurrency(quote.total)} quote (${quote.request.customerAddress}). ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/requests/${quote.requestId}`,
  });

  redirect(`/q/${acceptToken}`);
}
