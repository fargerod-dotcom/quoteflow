import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, timeAgo, telHref, mapsHref, googleCalendarHref } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats in Norwegian kroner", () => {
    expect(formatCurrency(1234.5).replace(/\s/g, " ")).toBe("1 234,50 kr");
    expect(formatCurrency("75").replace(/\s/g, " ")).toBe("75,00 kr");
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-09-02T12:00:00Z");

  it("says 'just now' under a minute", () => {
    expect(timeAgo(new Date("2026-09-02T11:59:30Z"), now)).toBe("just now");
  });

  it("uses minutes, hours and days", () => {
    expect(timeAgo(new Date("2026-09-02T11:45:00Z"), now)).toBe("15m ago");
    expect(timeAgo(new Date("2026-09-02T09:00:00Z"), now)).toBe("3h ago");
    expect(timeAgo(new Date("2026-08-31T12:00:00Z"), now)).toBe("2d ago");
  });

  it("falls back to a date after a week", () => {
    expect(timeAgo(new Date("2026-08-20T12:00:00Z"), now)).toMatch(/Aug 20/);
  });

  it("never goes negative for slightly-future timestamps (clock skew)", () => {
    expect(timeAgo(new Date("2026-09-02T12:00:05Z"), now)).toBe("just now");
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
