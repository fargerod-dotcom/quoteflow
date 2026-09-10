import { Decimal } from "@prisma/client/runtime/library";

import { countryOf, type CountryCode, type Lang } from "@/lib/countries";

/** Formats an amount in the currency of `country`, e.g. 1234.5 → "1 234,50 kr".
 *  `country` is required on purpose: an optional one would let a missed call
 *  site keep formatting in NOK with the compiler saying nothing. */
export function formatCurrency(value: number | string | Decimal, country: CountryCode): string {
  const c = countryOf(country);
  const n = Number(value);
  // Whole amounts drop the decimals ("750 kr", "£45"); fractional ones keep two.
  const fraction = Number.isInteger(n) ? 0 : 2;
  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.currency,
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(n);
}

/** Formats a number in the country's locale (decimal comma in nb-NO). */
export function formatNumber(value: number, country: CountryCode): string {
  return new Intl.NumberFormat(countryOf(country).locale).format(value);
}

function shortDate(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric" }).format(d);
}

export function formatDate(date: Date | string, country: CountryCode): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return shortDate(d, countryOf(country).locale);
}

/** "3m ago", "2h ago", "5d ago" — falls back to a short date after a week. */
export function timeAgo(date: Date | string, lang: Lang, now: Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (lang === "nb") {
    if (seconds < 60) return "nettopp";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min siden`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} t siden`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} d siden`;
    return shortDate(d, "nb-NO");
  }
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return shortDate(d, "en-US");
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
