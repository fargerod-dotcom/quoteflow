/**
 * The country registry: every fact that varies by where a business trades.
 *
 * Two rules govern this file:
 *  - **Plain data, zero imports.** Client components (`IntakeForm`,
 *    `LineItemsEditor`) look entries up themselves, so nothing heavy —
 *    `libphonenumber-js` above all — may be dragged in here. Phone *behaviour*
 *    lives in `src/lib/phone.ts`; this file holds only the phone *facts*.
 *  - **No functions inside the exported objects.** A server component cannot
 *    serialise a function across the RSC boundary; it passes `country="NO"` as
 *    a plain string instead.
 */

export type CountryCode = "NO" | "SE" | "DK" | "GB" | "IE" | "AU" | "NZ" | "US" | "CA";
export type Lang = "nb" | "en"; // sv/da join at Sweden

/** How a consumer-facing quote presents tax. */
export type TaxDisplay =
  | "inclusive" // headline total includes tax, breakdown shown above it
  | "none"; // no tax line at all (US default, and any vatRate === 0)

export type CountryConfig = {
  code: CountryCode;
  /** Endonym, shown in the (month-4) country selector. */
  name: string;
  lang: Lang;
  /** BCP-47 tag for Intl.NumberFormat / Intl.DateTimeFormat. */
  locale: string;
  /** ISO 4217. */
  currency: string;
  /** 0 = Sunday, 1 = Monday. Used by the week calendar. */
  firstDayOfWeek: 0 | 1;

  phone: {
    /** Dial prefix, no plus. */
    prefix: string;
    /** Valid national-number lengths after stripping the trunk "0". */
    nationalLengths: number[];
    /** Does the national format carry a leading trunk "0"? */
    trunkPrefix: boolean;
    /** Source pattern for a mobile national number; "" where the country does
     *  not distinguish mobile from landline by prefix (US/CA). Documentation
     *  and fallback only — lib/phone.ts asks libphonenumber-js. */
    mobilePattern: string;
    /** Placeholder shown in the intake form and onboarding. */
    exampleNational: string;
  };

  tax: {
    /** "MVA" | "VAT" | "GST" | "GST/HST" | "Sales tax" */
    label: string;
    /** Same word as it is written mid-sentence — Norwegian writes "mva" in
     *  running text and "MVA" standing alone; English does not care. */
    labelInline: string;
    /** Percent. 0 is legitimate. */
    defaultRate: number;
    consumerDisplay: TaxDisplay;
    /** QuoteFlow's own pricing page shows ex-tax in these markets. */
    b2bShowsExTax: boolean;
    /** True where registration is common enough to prefill; false where we
     *  must ask, because most one-van firms are below the threshold. */
    prefillRate: boolean;
    /** Shown next to the tax field at onboarding. */
    registrationNote?: string;
  };

  defaults: { hourlyRate: number; calloutFee: number };

  sms: {
    /** Can we set a branded alphanumeric From? */
    alphanumericSenderId: boolean;
    /** Pre-registration with the carriers required before it will deliver. */
    senderIdRegistration: "none" | "required";
  };

  stripe: {
    /** Lowercase, as Stripe wants it. */
    currency: string;
    /** Env var suffix: STRIPE_PRICE_MONTHLY_<suffix> / _ANNUAL_<suffix>. */
    priceEnvSuffix: string;
  };

  /** How much we trust `defaults` and `tax.defaultRate`. */
  confidence: "high" | "medium" | "low";
};

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  // high — 1 150/750 validated against Byggstart (950–1 350 kr/t); MVA 25% is not in dispute.
  NO: {
    code: "NO",
    name: "Norge",
    lang: "nb",
    locale: "nb-NO",
    currency: "NOK",
    firstDayOfWeek: 1,
    phone: {
      prefix: "47",
      nationalLengths: [8],
      trunkPrefix: false,
      mobilePattern: "^[49]",
      exampleNational: "980 53 546",
    },
    tax: {
      label: "MVA",
      labelInline: "mva",
      defaultRate: 25,
      consumerDisplay: "inclusive",
      b2bShowsExTax: true,
      prefillRate: true,
    },
    defaults: { hourlyRate: 1150, calloutFee: 750 },
    sms: { alphanumericSenderId: true, senderIdRegistration: "none" },
    stripe: { currency: "nok", priceEnvSuffix: "NOK" },
    confidence: "high",
  },

  // medium — Swedish sources scatter (Byggahus 900–1 400, Hantverkskollen 500–900,
  // Stockholm 850–980); 850 sits in the overlap. ROT (consumer labour tax credit)
  // needs its own quote line before Sweden ships — flagged, not designed.
  SE: {
    code: "SE",
    name: "Sverige",
    lang: "nb", // placeholder until an `sv` dictionary exists; see §3 of the design
    locale: "sv-SE",
    currency: "SEK",
    firstDayOfWeek: 1,
    phone: {
      prefix: "46",
      nationalLengths: [7, 8, 9],
      trunkPrefix: true,
      mobilePattern: "^7[02369]",
      exampleNational: "070 123 45 67",
    },
    tax: {
      label: "Moms",
      labelInline: "moms",
      defaultRate: 25,
      consumerDisplay: "inclusive",
      b2bShowsExTax: true,
      prefillRate: true,
    },
    defaults: { hourlyRate: 850, calloutFee: 600 },
    sms: { alphanumericSenderId: true, senderIdRegistration: "none" },
    stripe: { currency: "sek", priceEnvSuffix: "SEK" },
    confidence: "medium",
  },

  // medium — Kvaligo 550–850 ex moms, Boligekspertise 450–750; udkørselstillæg 350–600.
  DK: {
    code: "DK",
    name: "Danmark",
    lang: "nb", // placeholder until a `da` dictionary exists
    locale: "da-DK",
    currency: "DKK",
    firstDayOfWeek: 1,
    phone: {
      prefix: "45",
      nationalLengths: [8],
      trunkPrefix: false,
      mobilePattern: "^[2-9]",
      exampleNational: "20 12 34 56",
    },
    tax: {
      label: "Moms",
      labelInline: "moms",
      defaultRate: 25,
      consumerDisplay: "inclusive",
      b2bShowsExTax: true,
      prefillRate: true,
    },
    defaults: { hourlyRate: 650, calloutFee: 450 },
    sms: { alphanumericSenderId: true, senderIdRegistration: "none" },
    stripe: { currency: "dkk", priceEnvSuffix: "DKK" },
    confidence: "medium",
  },

  // medium on rate, high on tax — Checkatrade/Gas Engineer Software put 2026 near
  // £58 (£45–75), call-out £60–120. defaultRate 0 because the registration
  // threshold is £90 000 and our buyer is usually below it: onboarding asks.
  GB: {
    code: "GB",
    name: "United Kingdom",
    lang: "en",
    locale: "en-GB",
    currency: "GBP",
    firstDayOfWeek: 1,
    phone: {
      prefix: "44",
      nationalLengths: [10],
      trunkPrefix: true,
      mobilePattern: "^7[1-9]",
      exampleNational: "07911 123456",
    },
    tax: {
      label: "VAT",
      labelInline: "VAT",
      defaultRate: 0,
      consumerDisplay: "inclusive",
      b2bShowsExTax: true,
      prefillRate: false,
      registrationNote:
        "Leave this at 0 if you're not VAT-registered (turnover under £90,000) — no VAT line will show on your quotes.",
    },
    defaults: { hourlyRate: 60, calloutFee: 75 },
    sms: { alphanumericSenderId: true, senderIdRegistration: "none" },
    stripe: { currency: "gbp", priceEnvSuffix: "GBP" },
    confidence: "medium",
  },

  // low on rate, high on tax — no good 2026 Irish survey found; €75 is an
  // inference from UK rates plus the usual Irish premium. UNVERIFIED: check
  // before any Irish outreach. Tax is solid: 13.5% reduced rate on construction
  // services, service registration threshold €42 500.
  IE: {
    code: "IE",
    name: "Ireland",
    lang: "en",
    locale: "en-IE",
    currency: "EUR",
    firstDayOfWeek: 1,
    phone: {
      prefix: "353",
      nationalLengths: [9],
      trunkPrefix: true,
      mobilePattern: "^8[3-9]",
      exampleNational: "083 123 4567",
    },
    tax: {
      label: "VAT",
      labelInline: "VAT",
      defaultRate: 13.5,
      consumerDisplay: "inclusive",
      b2bShowsExTax: true,
      prefillRate: false,
      registrationNote:
        "13.5% applies to construction services. If materials come to more than two-thirds of the job, the standard 23% applies to the whole invoice — check with your accountant.",
    },
    defaults: { hourlyRate: 75, calloutFee: 80 },
    sms: { alphanumericSenderId: true, senderIdRegistration: "none" },
    stripe: { currency: "eur", priceEnvSuffix: "EUR" },
    confidence: "low",
  },

  // medium — Yellow Pages/Ultraflow give $90–180, Sydney ~$140. GST 10%, and
  // Australian Consumer Law *requires* a single GST-inclusive consumer price.
  // Registration threshold A$75 000, so prefill but keep editable.
  AU: {
    code: "AU",
    name: "Australia",
    lang: "en",
    locale: "en-AU",
    currency: "AUD",
    firstDayOfWeek: 1,
    phone: {
      prefix: "61",
      nationalLengths: [9],
      trunkPrefix: true,
      mobilePattern: "^4",
      exampleNational: "0412 345 678",
    },
    tax: {
      label: "GST",
      labelInline: "GST",
      defaultRate: 10,
      consumerDisplay: "inclusive",
      b2bShowsExTax: true,
      prefillRate: true,
    },
    defaults: { hourlyRate: 130, calloutFee: 90 },
    sms: { alphanumericSenderId: true, senderIdRegistration: "required" },
    stripe: { currency: "aud", priceEnvSuffix: "AUD" },
    confidence: "medium",
  },

  // medium — Auckland Plumbers Group $90 call-out + $140/hr ex GST; Water & Gas
  // Worx $155 first hour then $100. GST 15%, threshold NZ$60 000.
  NZ: {
    code: "NZ",
    name: "New Zealand",
    lang: "en",
    locale: "en-NZ",
    currency: "NZD",
    firstDayOfWeek: 1,
    phone: {
      prefix: "64",
      nationalLengths: [8, 9],
      trunkPrefix: true,
      mobilePattern: "^2",
      exampleNational: "021 123 456",
    },
    tax: {
      label: "GST",
      labelInline: "GST",
      defaultRate: 15,
      consumerDisplay: "inclusive",
      b2bShowsExTax: true,
      prefillRate: true,
    },
    defaults: { hourlyRate: 120, calloutFee: 95 },
    sms: { alphanumericSenderId: true, senderIdRegistration: "none" },
    stripe: { currency: "nzd", priceEnvSuffix: "NZD" },
    confidence: "medium",
  },

  // medium on rate ($75–150 band), deliberate on tax: labour on real-property
  // repair is untaxable in many states and taxable in others, decided per job.
  // One vatRate per business cannot model that, so: no tax line by default,
  // with a per-business override. Alphanumeric senders are impossible (10DLC).
  US: {
    code: "US",
    name: "United States",
    lang: "en",
    locale: "en-US",
    currency: "USD",
    firstDayOfWeek: 0,
    phone: {
      prefix: "1",
      nationalLengths: [10],
      trunkPrefix: false,
      mobilePattern: "", // US/CA do not distinguish mobile by prefix
      exampleNational: "(555) 123-4567",
    },
    tax: {
      label: "Sales tax",
      labelInline: "sales tax",
      defaultRate: 0,
      consumerDisplay: "none",
      b2bShowsExTax: false,
      prefillRate: false,
      registrationNote:
        "Most states don't charge sales tax on plumbing labour for real property, so quotes show no tax line by default. If your state does, enter the rate here.",
    },
    defaults: { hourlyRate: 110, calloutFee: 85 },
    sms: { alphanumericSenderId: false, senderIdRegistration: "required" },
    stripe: { currency: "usd", priceEnvSuffix: "USD" },
    confidence: "medium",
  },

  // low — GST 5% federal, HST 13–15% in five provinces, plus QST in Quebec, and
  // we do not store a province. Default 0 and ask, exactly as US, until a
  // Business.region field exists.
  CA: {
    code: "CA",
    name: "Canada",
    lang: "en",
    locale: "en-CA",
    currency: "CAD",
    firstDayOfWeek: 0,
    phone: {
      prefix: "1",
      nationalLengths: [10],
      trunkPrefix: false,
      mobilePattern: "",
      exampleNational: "(555) 123-4567",
    },
    tax: {
      label: "GST/HST",
      labelInline: "GST/HST",
      defaultRate: 0,
      consumerDisplay: "inclusive",
      b2bShowsExTax: true,
      prefillRate: false,
      registrationNote:
        "GST/HST varies by province. Leave at 0 if you're not registered, and check the rate for your province before entering one.",
    },
    defaults: { hourlyRate: 120, calloutFee: 100 },
    sms: { alphanumericSenderId: false, senderIdRegistration: "required" },
    stripe: { currency: "cad", priceEnvSuffix: "CAD" },
    confidence: "low",
  },
};

export const DEFAULT_COUNTRY: CountryCode = "NO";

/** Never throws: a garbage value in the column degrades to Norway rather than
 *  500-ing a customer-facing quote page. `hasOwnProperty` rather than a plain
 *  lookup so inherited keys ("constructor", "toString") degrade too. */
export function countryOf(code: string | null | undefined): CountryConfig {
  const key = code ?? "";
  return Object.prototype.hasOwnProperty.call(COUNTRIES, key)
    ? COUNTRIES[key as CountryCode]
    : COUNTRIES[DEFAULT_COUNTRY];
}
