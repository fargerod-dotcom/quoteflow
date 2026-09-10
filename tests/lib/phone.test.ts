import { describe, it, expect } from "vitest";
import { toE164, formatPhoneNational, isMobileIn } from "@/lib/phone";

describe("toE164", () => {
  // The four Norwegian cases that shipped before libphonenumber-js — kept
  // verbatim as a regression fence.
  it("normalises Norwegian mobiles however they're typed", () => {
    expect(toE164("98053546", "NO")).toBe("+4798053546");
    expect(toE164("980 53 546", "NO")).toBe("+4798053546");
    expect(toE164("4798053546", "NO")).toBe("+4798053546");
    expect(toE164("004798053546", "NO")).toBe("+4798053546");
    expect(toE164("00 47 980 53 546", "NO")).toBe("+4798053546");
    expect(toE164("+4798053546", "NO")).toBe("+4798053546");
  });

  it("strips the trunk 0 where the country has one", () => {
    expect(toE164("07911 123456", "GB")).toBe("+447911123456");
    expect(toE164("+447911123456", "GB")).toBe("+447911123456");
    expect(toE164("070 123 45 67", "SE")).toBe("+46701234567");
    expect(toE164("0412 345 678", "AU")).toBe("+61412345678");
    expect(toE164("083 123 4567", "IE")).toBe("+353831234567");
  });

  it("returns null for garbage instead of handing Twilio a '+'", () => {
    expect(toE164("hello", "NO")).toBeNull();
    expect(toE164("", "NO")).toBeNull();
    expect(toE164("980535", "NO")).toBeNull(); // too short
    expect(toE164("+47980535461", "NO")).toBeNull(); // too long
  });

  it("keeps a foreign number's own E.164 rather than forcing the local prefix", () => {
    expect(toE164("+46701234567", "NO")).toBe("+46701234567");
  });
});

describe("formatPhoneNational", () => {
  it("formats per country", () => {
    expect(formatPhoneNational("+4798053546", "NO")).toBe("98 05 35 46");
    expect(formatPhoneNational("+447911123456", "GB")).toBe("07911 123456");
    expect(formatPhoneNational("+14155552671", "US")).toBe("(415) 555-2671");
  });

  it("returns the input untouched when it can't be parsed", () => {
    expect(formatPhoneNational("  not a number ", "NO")).toBe("not a number");
  });
});

describe("isMobileIn", () => {
  it("accepts Norwegian 4x/9x mobiles", () => {
    expect(isMobileIn("+4798053546", "NO")).toBe(true);
    expect(isMobileIn("+4741234567", "NO")).toBe(true);
  });

  it("rejects Norwegian landlines and premium numbers", () => {
    expect(isMobileIn("+4722334455", "NO")).toBe(false); // Oslo landline
    expect(isMobileIn("+4782012345", "NO")).toBe(false); // premium 82x
  });

  it("rejects a number from another country", () => {
    expect(isMobileIn("+46701234567", "NO")).toBe(false);
    expect(isMobileIn("+4798053546", "GB")).toBe(false);
  });

  it("accepts a British mobile that libphonenumber attributes to Guernsey (+44 is shared)", () => {
    expect(isMobileIn("+447911123456", "GB")).toBe(true);
    expect(isMobileIn("+442079460000", "GB")).toBe(false); // landline
  });

  it("accepts any valid US/CA number — the mobile check is inert there by design", () => {
    expect(isMobileIn("+14155552671", "US")).toBe(true);
    expect(isMobileIn("+16135551234", "CA")).toBe(true);
    expect(isMobileIn("not a number", "US")).toBe(false);
  });

  it("never throws on garbage", () => {
    expect(isMobileIn("", "NO")).toBe(false);
    expect(isMobileIn("hello", "NO")).toBe(false);
  });
});
