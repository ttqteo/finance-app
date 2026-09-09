import { addMonths, addYears, isAfter } from "date-fns";

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
 * Steps a subscription's billing cycle forward from `startDate` until it lands
 * strictly after `now`, and returns that date.
 *
 * NOTE: stepping is VIEWER-LOCAL, the same convention as
 * `lib/dashboard/aggregate-by-month.ts`. Do not "fix" this to UTC.
 * `startDate` is a `timestamp` filled from a local-time date picker, and local
 * stepping is what keeps the day-of-month stable for whoever created the row.
 * The trade-off is that a DST transition between `startDate` and the result
 * shifts the instant by an hour, which can move the *UTC* calendar day for a
 * date-only input; the rendered day, which goes through `getLocale()` in the
 * viewer's zone, stays correct.
 */
export function nextPaymentDate(
  startDate: Date,
  frequency: string,
  now: Date = new Date()
): Date {
  const step = isYearly(frequency) ? addYears : addMonths;
  let next = startDate;
  let guard = 0;

  // `guard` bounds the walk in case `startDate` is far in the past or invalid.
  while (!isAfter(next, now) && guard < 1000) {
    next = step(next, 1);
    guard++;
  }

  return next;
}
