import { sendEmail } from "@/lib/email/resend";

/** The magic-link email body — extracted so it's testable without loading the full NextAuth config. */
export async function sendMagicLinkEmail({ identifier, url }: { identifier: string; url: string }): Promise<void> {
  await sendEmail({
    to: identifier,
    subject: "Your QuoteFlow sign-in link",
    html: `
      <p>Click the link below to sign in to QuoteFlow:</p>
      <p><a href="${url}">${url}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}
