import { describe, it, expect } from "vitest";
import {
  evaluateSmsPolicy,
  isAllowedSmsDestination,
  smsAlertThreshold,
  SMS_MONTHLY_CEILING,
} from "@/lib/sms/policy";

describe("isAllowedSmsDestination", () => {
  it("accepts Norwegian mobiles (+47 4x / 9x)", () => {
    expect(isAllowedSmsDestination("+4798053546")).toBe(true);
    expect(isAllowedSmsDestination("+4741234567")).toBe(true);
  });

  it("rejects Norwegian landlines, premium numbers and foreign numbers", () => {
    expect(isAllowedSmsDestination("+4722334455")).toBe(false); // Oslo landline
    expect(isAllowedSmsDestination("+4782012345")).toBe(false); // premium 82x
    expect(isAllowedSmsDestination("+15551234567")).toBe(false);
    expect(isAllowedSmsDestination("+4698053546")).toBe(false); // Sweden
    expect(isAllowedSmsDestination("+479805354")).toBe(false); // too short
    expect(isAllowedSmsDestination("+47980535461")).toBe(false); // too long
  });
});

describe("evaluateSmsPolicy", () => {
  it("allows a valid destination under the ceiling", () => {
    expect(evaluateSmsPolicy("+4798053546", 0)).toEqual({ ok: true });
    expect(evaluateSmsPolicy("+4798053546", SMS_MONTHLY_CEILING - 1)).toEqual({ ok: true });
  });

  it("blocks at the ceiling", () => {
    expect(evaluateSmsPolicy("+4798053546", SMS_MONTHLY_CEILING)).toEqual({
      ok: false,
      reason: "ceiling_reached",
    });
  });

  it("reports the destination problem before the ceiling problem", () => {
    expect(evaluateSmsPolicy("+15551234567", SMS_MONTHLY_CEILING)).toEqual({
      ok: false,
      reason: "blocked_destination",
    });
  });

  it("alert threshold is 80% of the ceiling", () => {
    expect(smsAlertThreshold()).toBe(240);
    expect(smsAlertThreshold(100)).toBe(80);
  });
});
