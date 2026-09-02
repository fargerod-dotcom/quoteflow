import { describe, it, expect, vi } from "vitest";

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn().mockResolvedValue({ sent: true }) }));
vi.mock("@/lib/email/resend", () => ({ sendEmail }));

import { sendMagicLinkEmail } from "@/lib/auth-email";

describe("sendMagicLinkEmail", () => {
  it("sends the magic-link URL to the given identifier", async () => {
    await sendMagicLinkEmail({ identifier: "owner@example.com", url: "https://app.test/callback?token=abc" });

    expect(sendEmail).toHaveBeenCalledTimes(1);
    const call = sendEmail.mock.calls[0][0];
    expect(call.to).toBe("owner@example.com");
    expect(call.subject).toMatch(/sign-in link/i);
    expect(call.html).toContain("https://app.test/callback?token=abc");
  });
});
