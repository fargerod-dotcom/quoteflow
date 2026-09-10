/**
 * SMS policy rules (no I/O) so they can be unit-tested, driven by the
 * per-country registry rather than by Norway-only constants.
 */

import { countryOf, type CountryCode } from "@/lib/countries";
import { isMobileIn } from "@/lib/phone";

/** Hard cap on outbound SMS per business per calendar month. */
export const SMS_MONTHLY_CEILING = 300;
/** Fraction of the ceiling at which the owner is warned. */
export const SMS_ALERT_FRACTION = 0.8;

/**
 * Destinations are pinned to the country the business trades in, and must be
 * mobile numbers there. Landlines, premium-rate and foreign numbers are
 * refused — a free account with an unverified "owner phone" is otherwise an
 * SMS-pumping target, and the fraud value is in premium ranges abroad.
 *
 * For NO this is the shipped `^\+47[49]\d{7}$` rule, now expressed in terms of
 * the registry. A null (unparseable) number is refused, not thrown on.
 */
export function isAllowedSmsDestination(e164: string | null, country: CountryCode): boolean {
  if (!e164) return false;
  if (!e164.startsWith(`+${countryOf(country).phone.prefix}`)) return false;
  return isMobileIn(e164, country);
}

/** The count at which the near-ceiling warning fires (exactly once). */
export function smsAlertThreshold(ceiling: number = SMS_MONTHLY_CEILING): number {
  return Math.floor(ceiling * SMS_ALERT_FRACTION);
}

export type SmsPolicyDecision = { ok: true } | { ok: false; reason: "blocked_destination" | "ceiling_reached" };

export function evaluateSmsPolicy(
  e164: string | null,
  country: CountryCode,
  sentThisMonth: number,
  ceiling: number = SMS_MONTHLY_CEILING
): SmsPolicyDecision {
  if (!isAllowedSmsDestination(e164, country)) return { ok: false, reason: "blocked_destination" };
  if (sentThisMonth >= ceiling) return { ok: false, reason: "ceiling_reached" };
  return { ok: true };
}
