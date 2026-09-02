import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/errors", () => ({
  logError: vi.fn(),
}));

const messagesCreate = vi.fn().mockResolvedValue({ sid: "SM123" });
const twilioConstructor = vi.fn((..._args: unknown[]) => ({ messages: { create: messagesCreate } }));

vi.mock("twilio", () => ({
  default: (...args: unknown[]) => twilioConstructor(...args),
}));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.clearAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("sendSms", () => {
  it("logs to console and never constructs the Twilio client when env vars are missing", async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM_NUMBER;
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { sendSms } = await import("@/lib/sms/twilio");
    const result = await sendSms({ to: "+15551234567", body: "hello" });

    expect(result.sent).toBe(false);
    expect(twilioConstructor).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it("calls Twilio's messages.create with the right fields when configured", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACxxxx";
    process.env.TWILIO_AUTH_TOKEN = "authtoken";
    process.env.TWILIO_FROM_NUMBER = "+15559990000";

    const { sendSms } = await import("@/lib/sms/twilio");
    const result = await sendSms({ to: "5551234567", body: "hi there" });

    expect(result.sent).toBe(true);
    expect(twilioConstructor).toHaveBeenCalledWith("ACxxxx", "authtoken");
    expect(messagesCreate).toHaveBeenCalledWith({
      to: "+15551234567",
      from: "+15559990000",
      body: "hi there",
    });
  });

  it("catches a Twilio SDK error and returns sent: false instead of throwing", async () => {
    process.env.TWILIO_ACCOUNT_SID = "ACxxxx";
    process.env.TWILIO_AUTH_TOKEN = "authtoken";
    process.env.TWILIO_FROM_NUMBER = "+15559990000";
    messagesCreate.mockRejectedValueOnce(new Error("Twilio is down"));

    const { sendSms } = await import("@/lib/sms/twilio");
    await expect(sendSms({ to: "+15551234567", body: "hi" })).resolves.toEqual({ sent: false });
  });
});
