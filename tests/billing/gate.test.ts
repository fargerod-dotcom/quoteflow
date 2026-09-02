import { describe, it, expect } from "vitest";
import { isBusinessActive } from "@/lib/billing/stripe";

function business(subscriptionStatus: string, trialEndsAt: Date) {
  return { subscriptionStatus, trialEndsAt } as never;
}

describe("isBusinessActive", () => {
  it("is active while trialing with a future trial end date", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(isBusinessActive(business("TRIALING", future))).toBe(true);
  });

  it("is not active when trialing but the trial has already ended", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isBusinessActive(business("TRIALING", past))).toBe(false);
  });

  it("is active with an ACTIVE subscription regardless of trialEndsAt", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isBusinessActive(business("ACTIVE", past))).toBe(true);
  });

  it("is not active when PAST_DUE", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(isBusinessActive(business("PAST_DUE", future))).toBe(false);
  });

  it("is not active when CANCELED", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    expect(isBusinessActive(business("CANCELED", future))).toBe(false);
  });
});
