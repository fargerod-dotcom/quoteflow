import { logError } from "@/lib/errors";
import { toE164 } from "@/lib/phone";
import { evaluateSmsPolicy, smsAlertThreshold } from "@/lib/sms/policy";
import { getMonthlySmsCount, notifyOwnerNearCeiling, recordSms } from "@/lib/sms/quota";
import type { CountryCode } from "@/lib/countries";

export type SendSmsInput = {
  to: string;
  body: string;
  /** Every SMS is charged to a business: destination policy and monthly ceiling apply. */
  businessId: string;
  /** The business's country — decides which numbers are reachable. Passed in
   *  rather than looked up: every caller already holds the business row. */
  country: CountryCode;
};

export type SendSmsResult = { sent: boolean; reason?: "blocked_destination" | "ceiling_reached" | "not_configured" | "error" };

/**
 * Sends an SMS via Twilio, subject to policy: allowed destinations only and a
 * per-business monthly ceiling. If Twilio credentials aren't configured, logs
 * the message to the console instead of throwing — lets the whole flow be
 * demoed without a Twilio account. Failures are logged, never thrown.
 */
export async function sendSms({ to, body, businessId, country }: SendSmsInput): Promise<SendSmsResult> {
  // null (unparseable) is a blocked destination, not something to hand Twilio.
  const e164 = toE164(to, country);
  const sentThisMonth = await getMonthlySmsCount(businessId);
  const decision = evaluateSmsPolicy(e164, country, sentThisMonth);
  if (!decision.ok) {
    await logError("sms.policy", `SMS refused: ${decision.reason}`, { businessId, to: e164 ?? to });
    return { sent: false, reason: decision.reason };
  }
  // The policy above refuses a null destination, so this is a real E.164 number.
  const destination = e164 as string;

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  let result: SendSmsResult;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.log(`[sms:fallback] to=${destination} body=${body}`);
    result = { sent: false, reason: "not_configured" };
  } else {
    try {
      const { default: Twilio } = await import("twilio");
      const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      await client.messages.create({ to: destination, from: TWILIO_FROM_NUMBER, body });
      result = { sent: true };
    } catch (err) {
      await logError("sms.twilio", err instanceof Error ? err.message : "Unknown Twilio error", { to: destination });
      return { sent: false, reason: "error" };
    }
  }

  // Count fallback sends too, so the ceiling behaves the same in dev as in prod.
  await recordSms(businessId, destination);
  if (sentThisMonth + 1 === smsAlertThreshold()) {
    await notifyOwnerNearCeiling(businessId, sentThisMonth + 1);
  }
  return result;
}
