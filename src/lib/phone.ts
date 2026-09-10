/**
 * Phone behaviour, over libphonenumber-js. Nine countries × (validity,
 * mobile-vs-landline, national formatting, trunk "0") is a library-sized
 * problem, on the one surface where being wrong costs money.
 *
 * **Server-side only.** The metadata is ~100 KB; nothing under `"use client"`
 * may import this file. Client components take the phone *facts* from
 * `@/lib/countries` (prefix, example number) instead.
 *
 * The `/mobile` metadata is deliberate: it is what makes `getType()` work, and
 * it means a landline is simply not "valid" here. Every caller wants a number
 * that can receive an SMS, so that is the right default — but it does mean
 * `toE164` returns null for a perfectly real landline.
 */

import { parsePhoneNumberFromString } from "libphonenumber-js/mobile";
import { countryOf, type CountryCode } from "@/lib/countries";

/** E.164 for Twilio, or null when the input isn't a valid mobile number in
 *  `country`. Null is the point: the old version turned "hello" into "+" and
 *  handed that to Twilio. */
export function toE164(raw: string, country: CountryCode): string | null {
  const p = parsePhoneNumberFromString(raw.trim(), country);
  return p?.isValid() ? p.number : null;
}

/** Pretty national form for display ("980 53 546", "07911 123456"); returns
 *  the input untouched when it cannot be parsed. */
export function formatPhoneNational(raw: string, country: CountryCode): string {
  const p = parsePhoneNumberFromString(raw.trim(), country);
  return p?.isValid() ? p.formatNational() : raw.trim();
}

/** True when `raw` is a mobile number reachable in `country`. */
export function isMobileIn(raw: string, country: CountryCode): boolean {
  const p = parsePhoneNumberFromString(raw.trim(), country);
  if (!p?.isValid()) return false;
  // Compared by calling code, not by `p.country`: a British 07911 number comes
  // back as "GG" (Guernsey shares +44), and it is still a number we can text.
  if (p.countryCallingCode !== countryOf(country).phone.prefix) return false;
  // US/CA cannot distinguish mobile from landline by prefix; the registry says
  // so with an empty mobilePattern, and we accept any valid number there.
  if (!countryOf(country).phone.mobilePattern) return true;
  const type = p.getType();
  return type === "MOBILE" || type === "FIXED_LINE_OR_MOBILE";
}
