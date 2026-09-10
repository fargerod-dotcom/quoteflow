import { describe, it, expect } from "vitest";
import { DICTIONARIES, t, type MessageKey } from "@/lib/i18n";

const en = DICTIONARIES.en;
const nb = DICTIONARIES.nb;
const keys = Object.keys(en) as MessageKey[];

/** Placeholder names in either brace style: {name} and {{name}}. */
function placeholders(s: string): string[] {
  return [...s.matchAll(/{+\s*(\w+)\s*}+/g)].map((m) => m[1]).sort();
}

describe("dictionaries", () => {
  it("has the same keys in both languages", () => {
    expect(Object.keys(nb).sort()).toEqual(Object.keys(en).sort());
  });

  it.each(keys)("%s is translated and keeps its placeholders", (key) => {
    expect(en[key].trim()).not.toBe("");
    expect(nb[key].trim()).not.toBe("");
    // Catches the classic bug where a translation quietly drops {total}.
    expect(placeholders(nb[key])).toEqual(placeholders(en[key]));
  });

  it("never hardcodes the tax word — it is interpolated from the registry", () => {
    for (const key of keys) {
      expect(nb[key]).not.toMatch(/\bMVA\b/i);
      expect(en[key]).not.toMatch(/\bVAT\b/i);
    }
  });

  it("leaves the editable {{...}} SMS templates alone", () => {
    expect(t("sms.newQuote", "nb")).toContain("{{customerName}}");
    expect(t("sms.confirmation", "nb")).toContain("{{scheduledDate}}");
  });
});

describe("t", () => {
  it("returns the string for the requested language", () => {
    expect(t("quote.total", "en")).toBe("Total");
    expect(t("quote.pickDate", "nb")).toBe("Velg en dato");
  });

  it("interpolates single-brace variables", () => {
    expect(t("quote.eyebrowFor", "nb", { name: "Kari" })).toBe("Tilbud til Kari");
    expect(t("quote.taxAtRate", "nb", { tax: "MVA", rate: 25 })).toBe("MVA 25 %");
    expect(t("quote.taxAtRate", "en", { tax: "GST", rate: 10 })).toBe("GST 10%");
  });

  it("resolves an unknown placeholder to an empty string, never to '{foo}'", () => {
    expect(t("quote.eyebrowFor", "nb", {})).toBe("Tilbud til ");
  });
});
