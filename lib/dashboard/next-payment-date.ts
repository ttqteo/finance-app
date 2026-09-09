import {
  addMonths,
  addYears,
  differenceInMonths,
  differenceInYears,
  isAfter,
} from "date-fns";

/**
 * `subscriptions.frequency` is a free-form `text` column whose schema comment
 * says `'monthly', 'yearly'`, but the only writer — the form in
 * `app/(site)/dashboard/subscriptions/page.tsx` — persists the uppercase
 * `"MONTHLY"` / `"YEARLY"` from its `z.enum`, and the one row currently in the
 * database is `"YEARLY"`. A strict `=== "yearly"` check would bill that plan
 * monthly, so the comparison is case-insensitive. Anything unrecognised still
 * falls back to monthly, which is the safer error: it shows a sooner date
 * rather than hiding an imminent charge.
 */
export const isYearly = (frequency: string) =>
  frequency.trim().toLowerCase() === "yearly";

/**
 * The estimate from `differenceIn*` truncates, and `addMonths` clamps short
 * months, so it can land one period short. A sweep of 11,664 start/now pairs
 * never needed more than two corrections; the bound is deliberately generous.
 *
 * It is NOT validation. An unparseable `startDate` makes every comparison
 * false, so the loop merely exhausts and returns `Invalid Date` — which
 * `format()` in the widgets throws `RangeError: Invalid time value` on, with no
 * error boundary above them to catch it. This bounds the loop, nothing more.
 */
const MAX_CORRECTION_STEPS = 12;

/**
 * Returns a subscription's first billing date strictly after `now`.
 *
 * The number of elapsed periods is counted once and applied to the ORIGINAL
 * `startDate`. Do not rewrite this as a loop that steps from its own previous
 * result: `addMonths` clamps short months, so compounding permanently loses the
 * day of month for any plan billed on the 29th to 31st. Stepping 2026-01-31
 * forward four times yields 2026-05-28 — Jan 31 clamps to Feb 28, and the 28th
 * is then carried forever — where `addMonths(2026-01-31, 4)` correctly yields
 * 2026-05-31. Billing systems count periods and apply them once; so does this.
 *
 * NOTE: stepping is VIEWER-LOCAL, the same convention as
 * `lib/dashboard/aggregate-by-month.ts`. Do not "fix" this to UTC.
 * `startDate` is a `timestamp` filled from a local-time date picker, and local
 * stepping is what keeps the day of month stable for whoever created the row.
 *
 * One caveat belongs to TEST FIXTURES, not to production data. A bare
 * `new Date("2026-01-15")` is UTC midnight, which has zero slack behind it. In
 * a zone whose UTC offset is *larger* at the result than at the start — a
 * northern spring-forward, e.g. America/New_York or Europe/London — local
 * stepping holds the wall clock, so the instant lands an hour earlier, crosses
 * back over UTC midnight, and `toISOString()` reads a day early. Merely
 * changing offset is not enough: Australia/Sydney falls back over the same span
 * and is unaffected. Real rows never hit this, because the Calendar picker
 * stores local midnight, hours away from the UTC boundary. Prefer a midday
 * fixture over a date-only string when asserting on `toISOString()`.
 */
export function nextPaymentDate(
  startDate: Date,
  frequency: string,
  now: Date = new Date()
): Date {
  const yearly = isYearly(frequency);
  const step = yearly ? addYears : addMonths;

  let periods = Math.max(
    0,
    yearly
      ? differenceInYears(now, startDate)
      : differenceInMonths(now, startDate)
  );
  let next = step(startDate, periods);

  for (let i = 0; i < MAX_CORRECTION_STEPS && !isAfter(next, now); i++) {
    periods++;
    next = step(startDate, periods);
  }

  return next;
}
