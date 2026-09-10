import { describe, it, expect } from "vitest";
import { COUNTRIES, DEFAULT_COUNTRY, countryOf, type CountryCode } from "@/lib/countries";

const entries = Object.entries(COUNTRIES) as [CountryCode, (typeof COUNTRIES)[CountryCode]][];

describe("COUNTRIES registry", () => {
  it.each(entries)("%s is internally consistent", (key, c) => {
    expect(c.code).toBe(key);
    expect(c.name.trim()).not.toBe("");
    expect(["nb", "en"]).toContain(c.lang);
    expect([0, 1]).toContain(c.firstDayOfWeek);

    // Currency and locale must survive Intl, which is what every price renders through.
    expect(c.currency).toMatch(/^[A-Z]{3}$/);
    expect(c.locale).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    expect(() => new Intl.NumberFormat(c.locale, { style: "currency", currency: c.currency }).format(1)).not.toThrow();
    expect(new Intl.Locale(c.locale).region).toBe(c.code);

    expect(c.phone.prefix).toMatch(/^\d+$/);
    expect(c.phone.nationalLengths.length).toBeGreaterThan(0);
    expect([...c.phone.nationalLengths].sort((a, b) => a - b)).toEqual(c.phone.nationalLengths);
    expect(c.phone.exampleNational.trim()).not.toBe("");
    if (c.phone.mobilePattern) expect(() => new RegExp(c.phone.mobilePattern)).not.toThrow();

    expect(c.tax.label.trim()).not.toBe("");
    expect(c.tax.labelInline.trim()).not.toBe("");
    expect(c.tax.defaultRate).toBeGreaterThanOrEqual(0);
    expect(c.tax.defaultRate).toBeLessThanOrEqual(100);
    expect(["inclusive", "none"]).toContain(c.tax.consumerDisplay);

    expect(c.defaults.hourlyRate).toBeGreaterThan(0);
    expect(c.defaults.calloutFee).toBeGreaterThan(0);

    expect(c.stripe.currency).toBe(c.currency.toLowerCase());
    expect(c.stripe.priceEnvSuffix).toBe(c.currency);
    expect(["high", "medium", "low"]).toContain(c.confidence);
  });

  it("covers the nine launch-plus-month-4 markets", () => {
    expect(Object.keys(COUNTRIES).sort()).toEqual(["AU", "CA", "DK", "GB", "IE", "NO", "NZ", "SE", "US"]);
  });

  it("keeps Norway's shipped numbers", () => {
    const no = COUNTRIES.NO;
    expect(no.defaults).toEqual({ hourlyRate: 1150, calloutFee: 750 });
    expect(no.tax).toMatchObject({ label: "MVA", defaultRate: 25, consumerDisplay: "inclusive" });
    expect(no.phone.prefix).toBe("47");
  });

  it("keeps a tax line off by default where a single rate cannot be honest", () => {
    expect(COUNTRIES.US.tax.consumerDisplay).toBe("none");
    for (const code of ["GB", "US", "CA"] as const) {
      expect(COUNTRIES[code].tax.defaultRate).toBe(0);
      expect(COUNTRIES[code].tax.prefillRate).toBe(false);
      expect(COUNTRIES[code].tax.registrationNote).toBeTruthy();
    }
  });
});

describe("countryOf", () => {
  it("returns the matching entry", () => {
    expect(countryOf("NO").code).toBe("NO");
    expect(countryOf("GB").code).toBe("GB");
  });

  it("degrades to the default country instead of throwing", () => {
    expect(countryOf("XX").code).toBe(DEFAULT_COUNTRY);
    expect(countryOf(null).code).toBe(DEFAULT_COUNTRY);
    expect(countryOf(undefined).code).toBe(DEFAULT_COUNTRY);
    expect(countryOf("").code).toBe(DEFAULT_COUNTRY);
    expect(countryOf("no").code).toBe(DEFAULT_COUNTRY); // case-sensitive by design
    expect(countryOf("constructor").code).toBe(DEFAULT_COUNTRY);
  });
});
