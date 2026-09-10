import { describe, it, expect } from "vitest";
import { quoteEmailHtml, bookingConfirmedEmailHtml, ownerNewRequestEmailHtml } from "@/lib/email/templates";

/** Intl uses narrow no-break spaces in nb-NO output; normalise for assertions. */
const nok = (s: string) => s.replace(/\s/g, " ");

const NO = { country: "NO", lang: "nb" } as const;

describe("quoteEmailHtml", () => {
  const html = quoteEmailHtml({
    ...NO,
    businessName: "Joe's Plumbing",
    customerName: "Sam",
    summary: "Replace the P-trap & re-seal.",
    lineItems: [
      { description: "Call-out fee", quantity: 1, unitPrice: 75 },
      { description: "Labour", quantity: 1.5, unitPrice: 95 },
    ],
    vatRate: 25,
    total: 271.88,
    estimatedHours: 1.5,
    link: "https://example.com/q/abc",
  });

  it("includes every line item with its extended price and the total", () => {
    expect(html).toContain("Call-out fee");
    expect(nok(html)).toContain("75,00 kr");
    expect(html).toContain("Labour");
    expect(html).toContain("× 1.5");
    expect(nok(html)).toContain("142,50 kr");
    expect(nok(html)).toContain("217,50 kr"); // delsum ekskl. mva
    expect(nok(html)).toContain("MVA 25 %");
    expect(nok(html)).toContain("54,38 kr");
    expect(nok(html)).toContain("271,88 kr");
    expect(html).toContain("Total inkl. mva");
  });

  it("is written in Norwegian for a Norwegian business", () => {
    expect(html).toContain("Hei Sam, her er tilbudet fra Joe's Plumbing.");
    expect(html).toContain("Se tilbudet og velg dato");
    expect(html).toContain("Beregnet tid på stedet: ca. 1,5 t");
    expect(html).toContain("Sendt med QuoteFlow");
  });

  it("omits the MVA rows when the rate is 0", () => {
    const plain = quoteEmailHtml({
      ...NO,
      businessName: "B",
      customerName: "S",
      summary: "s",
      lineItems: [{ description: "x", quantity: 1, unitPrice: 100 }],
      vatRate: 0,
      total: 100,
      estimatedHours: 1,
      link: "https://example.com",
    });
    expect(plain).not.toContain("MVA");
    expect(plain).not.toContain("ekskl.");
    expect(plain).toContain(">Total<");
  });

  it("shows no VAT line at all for a British business under the threshold", () => {
    const gb = quoteEmailHtml({
      country: "GB",
      lang: "en",
      businessName: "B",
      customerName: "S",
      summary: "s",
      lineItems: [
        { description: "Call-out", quantity: 1, unitPrice: 75 },
        { description: "Labour", quantity: 2, unitPrice: 60 },
      ],
      vatRate: 0,
      total: 195,
      estimatedHours: 2,
      link: "https://example.com",
    });
    expect(gb).not.toContain("VAT");
    expect(gb).not.toContain("Subtotal");
    expect(gb).toContain("£195.00");
    expect(gb).toContain(">Total<");
  });

  it("breaks VAT out for a registered British business", () => {
    const gb = quoteEmailHtml({
      country: "GB",
      lang: "en",
      businessName: "B",
      customerName: "S",
      summary: "s",
      lineItems: [{ description: "Labour", quantity: 3, unitPrice: 60 }],
      vatRate: 20,
      total: 216,
      estimatedHours: 3,
      link: "https://example.com",
    });
    expect(gb).toContain("Subtotal excl. VAT");
    expect(gb).toContain("VAT 20%");
    expect(gb).toContain("Total incl. VAT");
    expect(gb).toContain("£36.00");
  });

  it("links to the accept page and names the business", () => {
    expect(html).toContain('href="https://example.com/q/abc"');
    expect(html).toContain("Joe&#39;s Plumbing".replace("&#39;", "'"));
  });

  it("escapes HTML in user-supplied text", () => {
    const evil = quoteEmailHtml({
      ...NO,
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
  it("shows the date, address, total and calendar link in Norwegian", () => {
    const html = bookingConfirmedEmailHtml({
      ...NO,
      businessName: "Joe's Plumbing",
      customerName: "Sam",
      scheduledDate: new Date("2026-09-10T00:00:00Z"),
      total: 217.5,
      address: "Storgata 12",
      calendarLink: "https://calendar.google.com/x",
    });
    expect(nok(html)).toContain("10. sep.");
    expect(html).toContain("Storgata 12");
    expect(nok(html)).toContain("217,50 kr");
    expect(html).toContain("Legg til i Google Kalender");
    expect(html).toContain('href="https://calendar.google.com/x"');
  });
});

describe("ownerNewRequestEmailHtml", () => {
  it("carries the description and review link, in the dashboard's language", () => {
    const html = ownerNewRequestEmailHtml({
      country: "NO",
      businessName: "Joe's Plumbing",
      customerName: "Sam",
      address: "Storgata 12",
      description: "Leaking\nunder sink",
      total: 125,
      link: "https://example.com/dashboard/requests/1",
    });
    expect(html).toContain("Leaking\nunder sink");
    expect(nok(html)).toContain("125,00 kr");
    expect(html).toContain("New job request");
    expect(html).toContain('href="https://example.com/dashboard/requests/1"');
  });
});
