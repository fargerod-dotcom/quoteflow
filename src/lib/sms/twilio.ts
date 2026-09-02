import { logError } from "@/lib/errors";
import { toE164 } from "@/lib/utils";

export type SendSmsInput = {
  to: string;
  body: string;
};

/**
 * Sends an SMS via Twilio. If Twilio credentials aren't configured, logs the
 * message to the console instead of throwing — lets the whole flow be
 * demoed without a Twilio account. Failures are logged, never thrown.
 */
export async function sendSms({ to, body }: SendSmsInput): Promise<{ sent: boolean }> {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.log(`[sms:fallback] to=${to} body=${body}`);
    return { sent: false };
  }

  try {
    const { default: Twilio } = await import("twilio");
    const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      to: toE164(to),
      from: TWILIO_FROM_NUMBER,
      body,
    });
    return { sent: true };
  } catch (err) {
    await logError("sms.twilio", err instanceof Error ? err.message : "Unknown Twilio error", { to });
    return { sent: false };
  }
}
