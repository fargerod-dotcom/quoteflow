import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const logError = vi.fn();
vi.mock("@/lib/errors", () => ({
  logError: (...args: unknown[]) => logError(...args),
}));

const getMonthlySmsCount = vi.fn().mockResolvedValue(0);
const recordSms = vi.fn().mockResolvedValue(undefined);
const notifyOwnerNearCeiling = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/sms/quota", () => ({
  getMonthlySmsCount: (...args: unknown[]) => getMonthlySmsCount(...args),
  recordSms: (...args: unknown[]) => recordSms(...args),
  notifyOwnerNearCeiling: (...args: unknown[]) => notifyOwnerNearCeiling(...args),
}));

const messagesCreate = vi.fn().mockResolvedValue({ sid: "SM123" });
const twilioConstructor = vi.fn((..._args: unknown[]) => ({ messages: { create: messagesCreate } }));

vi.mock("twilio", () => ({
  default: (...args: unknown[]) => twilioConstructor(...args),
}));

const ORIGINAL_ENV = { ...process.env };
const BIZ = "biz_1";

function configureTwilio() {
  process.env.TWILIO_ACCOUNT_SID = "ACxxxx";
  process.env.TWILIO_AUTH_TOKEN = "authtoken";
  process.env.TWILIO_FROM_NUMBER = "+15559990000";
}

beforeEach(() => {
  vi.clearAllMocks();
  getMonthlySmsCount.mockResolvedValue(0);
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
    const result = await sendSms({ businessId: BIZ, country: "NO", to: "+4798053546", body: "hello" });

    expect(result).toEqual({ sent: false, reason: "not_configured" });
    expect(twilioConstructor).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
    // Fallback sends still count toward the ceiling.
    expect(recordSms).toHaveBeenCalledWith(BIZ, "+4798053546");
    logSpy.mockRestore();
  });

  it("calls Twilio's messages.create with the right fields when configured", async () => {
    configureTwilio();

    const { sendSms } = await import("@/lib/sms/twilio");
    const result = await sendSms({ businessId: BIZ, country: "NO", to: "980 53 546", body: "hi there" });

    expect(result.sent).toBe(true);
    expect(twilioConstructor).toHaveBeenCalledWith("ACxxxx", "authtoken");
    expect(messagesCreate).toHaveBeenCalledWith({
      to: "+4798053546",
      from: "+15559990000",
      body: "hi there",
    });
    expect(recordSms).toHaveBeenCalledWith(BIZ, "+4798053546");
  });

  it("catches a Twilio SDK error and returns sent: false instead of throwing", async () => {
    configureTwilio();
    messagesCreate.mockRejectedValueOnce(new Error("Twilio is down"));

    const { sendSms } = await import("@/lib/sms/twilio");
    await expect(sendSms({ businessId: BIZ, country: "NO", to: "+4741234567", body: "hi" })).resolves.toEqual({
      sent: false,
      reason: "error",
    });
    expect(recordSms).not.toHaveBeenCalled();
  });

  it("refuses non-Norwegian-mobile destinations without touching Twilio", async () => {
    configureTwilio();

    const { sendSms } = await import("@/lib/sms/twilio");
    const result = await sendSms({ businessId: BIZ, country: "NO", to: "+15551234567", body: "hi" });

    expect(result).toEqual({ sent: false, reason: "blocked_destination" });
    expect(twilioConstructor).not.toHaveBeenCalled();
    expect(recordSms).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalledWith("sms.policy", expect.stringContaining("blocked_destination"), expect.anything());
  });

  it("refuses to send once the business has hit its monthly ceiling", async () => {
    configureTwilio();
    getMonthlySmsCount.mockResolvedValue(300);

    const { sendSms } = await import("@/lib/sms/twilio");
    const result = await sendSms({ businessId: BIZ, country: "NO", to: "+4798053546", body: "hi" });

    expect(result).toEqual({ sent: false, reason: "ceiling_reached" });
    expect(messagesCreate).not.toHaveBeenCalled();
  });

  it("warns the owner exactly when the 80% threshold is crossed", async () => {
    configureTwilio();
    const { sendSms } = await import("@/lib/sms/twilio");

    getMonthlySmsCount.mockResolvedValue(238);
    await sendSms({ businessId: BIZ, country: "NO", to: "+4798053546", body: "hi" });
    expect(notifyOwnerNearCeiling).not.toHaveBeenCalled();

    getMonthlySmsCount.mockResolvedValue(239);
    await sendSms({ businessId: BIZ, country: "NO", to: "+4798053546", body: "hi" });
    expect(notifyOwnerNearCeiling).toHaveBeenCalledWith(BIZ, 240);
  });
});
