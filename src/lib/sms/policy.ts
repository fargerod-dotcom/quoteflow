/**
 * Pure SMS policy rules (no I/O) so they can be unit-tested and, later,
 * driven by a per-country registry instead of the Norway-only constants here.
 */

/** Hard cap on outbound SMS per business per calendar month. */
export const SMS_MONTHLY_CEILING = 300;
/** Fraction of the ceiling at which the owner is warned. */
export const SMS_ALERT_FRACTION = 0.8;

/**
 * Only Norwegian mobile numbers for now: +47 followed by 8 digits starting
 * with 4 or 9. Landlines, premium-rate and foreign numbers are refused — a
 * free account with an unverified "owner phone" is otherwise an SMS-pumping
 * target.
 */
export function isAllowedSmsDestination(e164: string): boolean {
  return /^\+47[49]\d{7}$/.test(e164);
}

/** The count at which the near-ceiling warning fires (exactly once). */
export function smsAlertThreshold(ceiling: number = SMS_MONTHLY_CEILING): number {
  return Math.floor(ceiling * SMS_ALERT_FRACTION);
}

export type SmsPolicyDecision = { ok: true } | { ok: false; reason: "blocked_destination" | "ceiling_reached" };

export function evaluateSmsPolicy(e164: string, sentThisMonth: number, ceiling: number = SMS_MONTHLY_CEILING): SmsPolicyDecision {
  if (!isAllowedSmsDestination(e164)) return { ok: false, reason: "blocked_destination" };
  if (sentThisMonth >= ceiling) return { ok: false, reason: "ceiling_reached" };
  return { ok: true };
}
