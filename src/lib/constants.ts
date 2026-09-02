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

export const DEFAULT_SMS_TEMPLATE_NEW_QUOTE =
  "Hi {{customerName}}, {{businessName}} sent you a quote for your job: {{total}}. View and accept it here: {{link}}";

export const DEFAULT_SMS_TEMPLATE_FOLLOW_UP =
  "Hi {{customerName}}, just a friendly follow-up on the quote {{businessName}} sent you. You can review and accept it here: {{link}}";

export const DEFAULT_SMS_TEMPLATE_CONFIRMATION =
  "You're booked! {{businessName}} will see you on {{scheduledDate}}. Reply to this text if you need to reschedule.";

export const OWNER_NEW_REQUEST_SMS =
  "New job request from {{customerName}} ({{customerAddress}}). Review and send a quote: {{link}}";
