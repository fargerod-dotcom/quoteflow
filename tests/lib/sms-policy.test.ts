import { describe, it, expect } from "vitest";
import {
  evaluateSmsPolicy,
  isAllowedSmsDestination,
  smsAlertThreshold,
  SMS_MONTHLY_CEILING,
} from "@/lib/sms/policy";

describe("isAllowedSmsDestination", () => {
  it("accepts Norwegian mobiles (+47 4x / 9x)", () => {
    expect(isAllowedSmsDestination("+4798053546", "NO")).toBe(true);
    expect(isAllowedSmsDestination("+4741234567", "NO")).toBe(true);
  });

  it("rejects Norwegian landlines, premium numbers and foreign numbers", () => {
    expect(isAllowedSmsDestination("+4722334455", "NO")).toBe(false); // Oslo landline
    expect(isAllowedSmsDestination("+4782012345", "NO")).toBe(false); // premium 82x
    expect(isAllowedSmsDestination("+15551234567", "NO")).toBe(false);
    expect(isAllowedSmsDestination("+46701234567", "NO")).toBe(false); // a Swedish mobile
    expect(isAllowedSmsDestination("+479805354", "NO")).toBe(false); // too short
    expect(isAllowedSmsDestination("+47980535461", "NO")).toBe(false); // too long
  });

  it("refuses an unparseable destination instead of throwing", () => {
    expect(isAllowedSmsDestination(null, "NO")).toBe(false);
    expect(isAllowedSmsDestination("", "NO")).toBe(false);
    expect(isAllowedSmsDestination("+", "NO")).toBe(false);
  });

  it("follows the business's own country", () => {
    expect(isAllowedSmsDestination("+447911123456", "GB")).toBe(true);
    expect(isAllowedSmsDestination("+442079460000", "GB")).toBe(false); // landline
    expect(isAllowedSmsDestination("+4798053546", "GB")).toBe(false);
  });

  it("accepts any valid US number — the mobile check is inert there, the ceiling is the defence", () => {
    expect(isAllowedSmsDestination("+14155552671", "US")).toBe(true);
    expect(isAllowedSmsDestination("+4798053546", "US")).toBe(false);
  });
});

describe("evaluateSmsPolicy", () => {
  it("allows a valid destination under the ceiling", () => {
    expect(evaluateSmsPolicy("+4798053546", "NO", 0)).toEqual({ ok: true });
    expect(evaluateSmsPolicy("+4798053546", "NO", SMS_MONTHLY_CEILING - 1)).toEqual({ ok: true });
  });

  it("blocks at the ceiling", () => {
    expect(evaluateSmsPolicy("+4798053546", "NO", SMS_MONTHLY_CEILING)).toEqual({
      ok: false,
      reason: "ceiling_reached",
    });
  });

  it("reports the destination problem before the ceiling problem", () => {
    expect(evaluateSmsPolicy("+15551234567", "NO", SMS_MONTHLY_CEILING)).toEqual({
      ok: false,
      reason: "blocked_destination",
    });
  });

  it("treats a null destination as blocked, not as an exception", () => {
    expect(evaluateSmsPolicy(null, "NO", 0)).toEqual({ ok: false, reason: "blocked_destination" });
  });

  it("alert threshold is 80% of the ceiling", () => {
    expect(smsAlertThreshold()).toBe(240);
    expect(smsAlertThreshold(100)).toBe(80);
  });
});
