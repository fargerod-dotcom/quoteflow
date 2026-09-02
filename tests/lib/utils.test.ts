import { describe, it, expect } from "vitest";
import { toE164 } from "@/lib/utils";

describe("toE164", () => {
  it("passes through a already-E.164 number unchanged", () => {
    expect(toE164("+15551234567")).toBe("+15551234567");
  });

  it("adds +1 to a bare 10-digit US number", () => {
    expect(toE164("5551234567")).toBe("+15551234567");
  });

  it("adds + to an 11-digit number already starting with the US country code", () => {
    expect(toE164("15551234567")).toBe("+15551234567");
  });

  it("converts the 00 international dialing prefix to +", () => {
    expect(toE164("004798053546")).toBe("+4798053546");
  });

  it("handles 00-prefixed numbers with formatting characters", () => {
    expect(toE164("00 47 980 53 546")).toBe("+4798053546");
  });
});
