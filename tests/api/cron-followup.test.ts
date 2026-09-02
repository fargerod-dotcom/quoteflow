import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.CRON_SECRET = "test-cron-secret";
process.env.NEXT_PUBLIC_APP_URL = "https://app.test";

const { findMany, update, sendSms } = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn().mockResolvedValue({}),
  sendSms: vi.fn().mockResolvedValue({ sent: true }),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { quote: { findMany, update } } }));
vi.mock("@/lib/sms/twilio", () => ({ sendSms }));

import { GET } from "@/app/api/cron/follow-up/route";

function request(auth?: string) {
  const headers = new Headers();
  if (auth) headers.set("authorization", auth);
  return new Request("http://localhost/api/cron/follow-up", { headers });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("cron follow-up route", () => {
  it("rejects requests without the correct bearer secret", async () => {
    const res = await GET(request("Bearer wrong"));
    expect(res.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();

    const resNoHeader = await GET(request());
    expect(resNoHeader.status).toBe(401);
  });

  it("queries for SENT quotes older than 48h with no reply and no prior follow-up", async () => {
    findMany.mockResolvedValue([]);
    await GET(request("Bearer test-cron-secret"));

    const query = findMany.mock.calls[0][0];
    expect(query.where.status).toBe("SENT");
    expect(query.where.followUpSentAt).toBeNull();
    expect(query.where.respondedAt).toBeNull();
    const cutoffMs = Date.now() - query.where.sentAt.lt.getTime();
    expect(Math.abs(cutoffMs - 48 * 60 * 60 * 1000)).toBeLessThan(5000);
  });

  it("sends a follow-up SMS per due quote and stamps followUpSentAt", async () => {
    findMany.mockResolvedValue([
      {
        id: "quote-1",
        acceptToken: "token-1",
        request: {
          customerName: "Jane",
          customerPhone: "+15551234567",
          business: { name: "Joe's Plumbing", smsTemplateFollowUp: null },
        },
      },
      {
        id: "quote-2",
        acceptToken: "token-2",
        request: {
          customerName: "Bob",
          customerPhone: "+15559876543",
          business: { name: "Ace Electric", smsTemplateFollowUp: "Reminder for {{customerName}}: {{link}}" },
        },
      },
    ]);

    const res = await GET(request("Bearer test-cron-secret"));
    const json = await res.json();

    expect(json).toEqual({ checked: 2, sent: 2 });
    expect(sendSms).toHaveBeenCalledTimes(2);
    expect(sendSms).toHaveBeenCalledWith({
      to: "+15559876543",
      body: "Reminder for Bob: https://app.test/q/token-2",
    });
    expect(update).toHaveBeenCalledWith({ where: { id: "quote-1" }, data: { followUpSentAt: expect.any(Date) } });
    expect(update).toHaveBeenCalledWith({ where: { id: "quote-2" }, data: { followUpSentAt: expect.any(Date) } });
  });
});
