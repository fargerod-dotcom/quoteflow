import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms/twilio";
import { interpolate } from "@/lib/utils";
import { DEFAULT_SMS_TEMPLATE_FOLLOW_UP, FOLLOW_UP_HOURS } from "@/lib/constants";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - FOLLOW_UP_HOURS * 60 * 60 * 1000);

  const dueQuotes = await prisma.quote.findMany({
    where: {
      status: "SENT",
      sentAt: { lt: cutoff },
      followUpSentAt: null,
      respondedAt: null,
    },
    include: { request: { include: { business: true } } },
  });

  let sent = 0;
  for (const quote of dueQuotes) {
    const { business, customerName, customerPhone } = quote.request;
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quote.acceptToken}`;
    const body = interpolate(business.smsTemplateFollowUp ?? DEFAULT_SMS_TEMPLATE_FOLLOW_UP, {
      customerName,
      businessName: business.name,
      link,
    });

    await sendSms({ to: customerPhone, body });
    await prisma.quote.update({ where: { id: quote.id }, data: { followUpSentAt: new Date() } });
    sent += 1;
  }

  return NextResponse.json({ checked: dueQuotes.length, sent });
}
