import { describe, it, expect } from "vitest";
import { quoteEmailHtml, bookingConfirmedEmailHtml, ownerNewRequestEmailHtml } from "@/lib/email/templates";

describe("quoteEmailHtml", () => {
  const html = quoteEmailHtml({
    businessName: "Joe's Plumbing",
    customerName: "Sam",
    summary: "Replace the P-trap & re-seal.",
    lineItems: [
      { description: "Call-out fee", quantity: 1, unitPrice: 75 },
      { description: "Labour", quantity: 1.5, unitPrice: 95 },
    ],
    total: 217.5,
    estimatedHours: 1.5,
    link: "https://example.com/q/abc",
  });

  it("includes every line item with its extended price and the total", () => {
    expect(html).toContain("Call-out fee");
    expect(html).toContain("$75.00");
    expect(html).toContain("Labour");
    expect(html).toContain("× 1.5");
    expect(html).toContain("$142.50");
    expect(html).toContain("$217.50");
  });

  it("links to the accept page and names the business", () => {
    expect(html).toContain('href="https://example.com/q/abc"');
    expect(html).toContain("Joe&#39;s Plumbing".replace("&#39;", "'"));
  });

  it("escapes HTML in user-supplied text", () => {
    const evil = quoteEmailHtml({
      businessName: "<script>alert(1)</script>",
      customerName: "Sam",
      summary: "<img src=x>",
      lineItems: [{ description: "<b>x</b>", quantity: 1, unitPrice: 1 }],
      total: 1,
      estimatedHours: 1,
      link: "https://example.com",
    });
    expect(evil).not.toContain("<script>");
    expect(evil).toContain("&lt;script&gt;");
    expect(evil).not.toContain("<img src=x>");
    expect(evil).not.toContain("<b>x</b>");
  });
});

describe("bookingConfirmedEmailHtml", () => {
  it("shows the date, address, total and calendar link", () => {
    const html = bookingConfirmedEmailHtml({
      businessName: "Joe's Plumbing",
      customerName: "Sam",
      scheduledDate: new Date("2026-09-10T00:00:00Z"),
      total: 217.5,
      address: "12 Main St",
      calendarLink: "https://calendar.google.com/x",
    });
    expect(html).toContain("Sep 10");
    expect(html).toContain("12 Main St");
    expect(html).toContain("$217.50");
    expect(html).toContain('href="https://calendar.google.com/x"');
  });
});

describe("ownerNewRequestEmailHtml", () => {
  it("carries the description and review link", () => {
    const html = ownerNewRequestEmailHtml({
      businessName: "Joe's Plumbing",
      customerName: "Sam",
      address: "12 Main St",
      description: "Leaking\nunder sink",
      total: 125,
      link: "https://example.com/dashboard/requests/1",
    });
    expect(html).toContain("Leaking\nunder sink");
    expect(html).toContain("$125.00");
    expect(html).toContain('href="https://example.com/dashboard/requests/1"');
  });
});
