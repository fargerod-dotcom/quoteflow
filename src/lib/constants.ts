/** Currency, locale, phone rules and the default rates now live per country in
 *  src/lib/countries.ts; the customer-facing copy lives in src/lib/i18n.ts. */

export const TRADES = [
  { value: "PLUMBING", label: "Plumbing" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "HVAC", label: "HVAC" },
  { value: "HANDYMAN", label: "Handyman" },
  { value: "LANDSCAPING", label: "Landscaping" },
  { value: "OTHER", label: "Other" },
] as const;

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB per photo

export const TRIAL_DAYS = 14;
export const FOLLOW_UP_HOURS = 48;

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  QUOTED: "Quoted",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

/** The three customer-facing SMS defaults are language-aware and live in the
 *  dictionary instead: sms.newQuote / sms.followUp / sms.confirmation. */

/** Owner-facing, so it stays in the dashboard's language. */
export const OWNER_NEW_REQUEST_SMS =
  "New job request from {{customerName}} ({{customerAddress}}). Review and send a quote: {{link}}";
