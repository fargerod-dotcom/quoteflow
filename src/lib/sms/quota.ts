import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/resend";
import { logError } from "@/lib/errors";
import { SMS_MONTHLY_CEILING } from "@/lib/sms/policy";

function startOfMonth(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Outbound SMS this business has sent since the 1st of the month. */
export async function getMonthlySmsCount(businessId: string): Promise<number> {
  return prisma.smsLog.count({ where: { businessId, createdAt: { gte: startOfMonth() } } });
}

export async function recordSms(businessId: string, to: string): Promise<void> {
  await prisma.smsLog.create({ data: { businessId, to } });
}

/** Warns the owner (email + error log) that they're close to the monthly SMS cap. */
export async function notifyOwnerNearCeiling(businessId: string, sent: number): Promise<void> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { name: true, ownerNotifyEmail: true, user: { select: { email: true } } },
  });
  await logError("sms.ceiling", `Business ${businessId} has sent ${sent}/${SMS_MONTHLY_CEILING} SMS this month`, {
    businessId,
  });
  const to = business?.ownerNotifyEmail ?? business?.user.email;
  if (!to) return;
  await sendEmail({
    to,
    subject: `QuoteFlow: ${sent} of ${SMS_MONTHLY_CEILING} text messages used this month`,
    html: `<p>Hi,</p><p>${business?.name ?? "Your business"} has sent ${sent} of the ${SMS_MONTHLY_CEILING} text messages included this month. When the limit is reached, quotes are still sent by email and shown in your inbox, but no more texts go out until the 1st.</p><p>If you expect more than this, reply to this email and we'll raise it.</p>`,
  });
}
