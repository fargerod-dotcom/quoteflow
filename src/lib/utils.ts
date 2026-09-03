import { Decimal } from "@prisma/client/runtime/library";

import { CURRENCY, CURRENCY_LOCALE, DEFAULT_COUNTRY_CODE } from "@/lib/constants";

/** Formats an amount in the app currency, e.g. 1234.5 → "1 234,50 kr". */
export function formatCurrency(value: number | string | Decimal): string {
  const num = typeof value === "object" ? Number(value) : Number(value);
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY,
  }).format(num);
}

/** Pretty-prints a phone number for display: Norwegian 8-digit numbers as
 * "412 34 567" (with the +47 kept if given); anything else is returned as typed. */
export function formatPhone(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  const national = digits.length === 10 && digits.startsWith(DEFAULT_COUNTRY_CODE) ? digits.slice(2) : digits;
  if (national.length === 8) {
    const pretty = `${national.slice(0, 3)} ${national.slice(3, 5)} ${national.slice(5)}`;
    return national === digits ? pretty : `+${DEFAULT_COUNTRY_CODE} ${pretty}`;
  }
  return trimmed;
}

/** Normalizes a phone number to E.164 for Twilio. Handles a leading "+" or the
 * "00" international dialing prefix; a bare 8-digit number is assumed to be
 * Norwegian (+47). Best-effort, not full E.164 validation. */
export function toE164(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) return `+${trimmed.replace(/\D/g, "")}`;
  if (trimmed.startsWith("00")) return `+${trimmed.replace(/\D/g, "").slice(2)}`;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 8) return `+${DEFAULT_COUNTRY_CODE}${digits}`;
  if (digits.length === 10 && digits.startsWith(DEFAULT_COUNTRY_CODE)) return `+${digits}`;
  return `+${digits}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

/** "3m ago", "2h ago", "5d ago" — falls back to a short date after a week. */
export function timeAgo(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function telHref(raw: string): string {
  return `tel:${raw.replace(/[^\d+]/g, "")}`;
}

export function mapsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** Google Calendar "add event" link for an all-day job. */
export function googleCalendarHref({
  title,
  date,
  details,
  location,
}: {
  title: string;
  date: Date;
  details?: string;
  location?: string;
}): string {
  const ymd = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const end = new Date(date);
  end.setUTCDate(end.getUTCDate() + 1);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${ymd(date)}/${ymd(end)}`,
  });
  if (details) params.set("details", details);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
