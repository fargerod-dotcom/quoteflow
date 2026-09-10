import { logError } from "@/lib/errors";
import { toE164 } from "@/lib/utils";
import { evaluateSmsPolicy, smsAlertThreshold } from "@/lib/sms/policy";
import { getMonthlySmsCount, notifyOwnerNearCeiling, recordSms } from "@/lib/sms/quota";

export type SendSmsInput = {
  to: string;
  body: string;
  /** Every SMS is charged to a business: destination policy and monthly ceiling apply. */
  businessId: string;
};

export type SendSmsResult = { sent: boolean; reason?: "blocked_destination" | "ceiling_reached" | "not_configured" | "error" };

/**
 * Sends an SMS via Twilio, subject to policy: allowed destinations only and a
 * per-business monthly ceiling. If Twilio credentials aren't configured, logs
 * the message to the console instead of throwing — lets the whole flow be
 * demoed without a Twilio account. Failures are logged, never thrown.
 */
export async function sendSms({ to, body, businessId }: SendSmsInput): Promise<SendSmsResult> {
  const e164 = toE164(to);
  const sentThisMonth = await getMonthlySmsCount(businessId);
  const decision = evaluateSmsPolicy(e164, sentThisMonth);
  if (!decision.ok) {
    await logError("sms.policy", `SMS refused: ${decision.reason}`, { businessId, to: e164 });
    return { sent: false, reason: decision.reason };
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  let result: SendSmsResult;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.log(`[sms:fallback] to=${e164} body=${body}`);
    result = { sent: false, reason: "not_configured" };
  } else {
    try {
      const { default: Twilio } = await import("twilio");
      const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      await client.messages.create({ to: e164, from: TWILIO_FROM_NUMBER, body });
      result = { sent: true };
    } catch (err) {
      await logError("sms.twilio", err instanceof Error ? err.message : "Unknown Twilio error", { to: e164 });
      return { sent: false, reason: "error" };
    }
  }

  // Count fallback sends too, so the ceiling behaves the same in dev as in prod.
  await recordSms(businessId, e164);
  if (sentThisMonth + 1 === smsAlertThreshold()) {
    await notifyOwnerNearCeiling(businessId, sentThisMonth + 1);
  }
  return result;
}
