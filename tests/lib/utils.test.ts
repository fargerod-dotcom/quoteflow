import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, timeAgo, telHref, mapsHref, googleCalendarHref } from "@/lib/utils";

/** Intl uses narrow no-break spaces; normalise them for assertions. */
const norm = (s: string) => s.replace(/\s/g, " ");

describe("formatCurrency", () => {
  it("formats in the country's currency and separators", () => {
    expect(norm(formatCurrency(1234.5, "NO"))).toBe("1 234,50 kr");
    expect(norm(formatCurrency("75", "NO"))).toBe("75 kr");
    expect(norm(formatCurrency(1234.5, "GB"))).toBe("£1,234.50");
    expect(norm(formatCurrency(1234.5, "US"))).toBe("$1,234.50");
    expect(norm(formatCurrency(1234.5, "SE"))).toBe("1 234,50 kr");
    expect(norm(formatCurrency(1234.5, "AU"))).toBe("$1,234.50");
  });

  it("falls back to Norway rather than throwing on a bad country", () => {
    expect(norm(formatCurrency(1234.5, "XX" as never))).toBe("1 234,50 kr");
  });
});

describe("formatDate", () => {
  const d = new Date("2026-09-10T00:00:00Z");

  it("uses the country's locale, including US month-first ordering", () => {
    expect(formatDate(d, "US")).toMatch(/Sep 10/);
    expect(formatDate(d, "GB")).toMatch(/10 Sep/);
    expect(norm(formatDate(d, "NO"))).toMatch(/10\. sep\./);
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-09-02T12:00:00Z");

  it("says 'just now' under a minute", () => {
    expect(timeAgo(new Date("2026-09-02T11:59:30Z"), "en", now)).toBe("just now");
  });

  it("uses minutes, hours and days", () => {
    expect(timeAgo(new Date("2026-09-02T11:45:00Z"), "en", now)).toBe("15m ago");
    expect(timeAgo(new Date("2026-09-02T09:00:00Z"), "en", now)).toBe("3h ago");
    expect(timeAgo(new Date("2026-08-31T12:00:00Z"), "en", now)).toBe("2d ago");
  });

  it("falls back to a date after a week", () => {
    expect(timeAgo(new Date("2026-08-20T12:00:00Z"), "en", now)).toMatch(/Aug 20/);
  });

  it("speaks Norwegian when asked", () => {
    expect(timeAgo(new Date("2026-09-02T11:59:30Z"), "nb", now)).toBe("nettopp");
    expect(timeAgo(new Date("2026-09-02T09:00:00Z"), "nb", now)).toBe("3 t siden");
  });

  it("never goes negative for slightly-future timestamps (clock skew)", () => {
    expect(timeAgo(new Date("2026-09-02T12:00:05Z"), "en", now)).toBe("just now");
  });
});

describe("link helpers", () => {
  it("strips formatting from tel: links", () => {
    expect(telHref("(555) 123-4567")).toBe("tel:5551234567");
    expect(telHref("+47 980 53 546")).toBe("tel:+4798053546");
  });

  it("URL-encodes the address for Google Maps", () => {
    expect(mapsHref("12 Main St, Springfield")).toBe(
      "https://www.google.com/maps/search/?api=1&query=12%20Main%20St%2C%20Springfield"
    );
  });

  it("builds an all-day Google Calendar event ending the next day", () => {
    const href = googleCalendarHref({
      title: "Joe's Plumbing — leak",
      date: new Date("2026-09-10T00:00:00Z"),
      location: "12 Main St",
      details: "Total: $100",
    });
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("dates")).toBe("20260910/20260911");
    expect(url.searchParams.get("text")).toBe("Joe's Plumbing — leak");
    expect(url.searchParams.get("location")).toBe("12 Main St");
    expect(url.searchParams.get("details")).toBe("Total: $100");
  });

  it("rolls the calendar end date over month boundaries", () => {
    const href = googleCalendarHref({ title: "x", date: new Date("2026-09-30T00:00:00Z") });
    expect(new URL(href).searchParams.get("dates")).toBe("20260930/20261001");
  });
});
