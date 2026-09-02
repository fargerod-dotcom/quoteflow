import { logError } from "@/lib/errors";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Sends an email via Resend. If RESEND_API_KEY isn't configured, logs the
 * email to the console instead of throwing. Also used for Auth.js magic-link
 * emails (see lib/auth.ts). Failures are logged, never thrown.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ sent: boolean }> {
  const { RESEND_API_KEY, EMAIL_FROM } = process.env;

  if (!RESEND_API_KEY) {
    console.log(`[email:fallback] to=${to} subject=${subject}\n${html}`);
    return { sent: false };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: EMAIL_FROM ?? "QuoteFlow <noreply@example.com>",
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    await logError("email.resend", err instanceof Error ? err.message : "Unknown Resend error", { to, subject });
    return { sent: false };
  }
}
