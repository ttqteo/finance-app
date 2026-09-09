export type DailySummaryRow = {
  date: string | Date;
  income: number;
  expenses: number;
};

export type DayTotals = { income: number; expenses: number };

export type DailyTotals = {
  /**
   * Keyed by local calendar day. A key is present if and only if that day fell
   * inside the queried window, so `byDay.has(key)` answers "was this day asked
   * about?" and `byDay.get(key)` answers "what happened on it?". Those are two
   * different questions and a calendar that conflates them reports days it
   * never asked about as days on which nothing happened.
   */
  byDay: Map<string, DayTotals>;
  /** Earliest and latest day in the window, or null when nothing was queried. */
  start: Date | null;
  end: Date | null;
};

/**
 * Local calendar key. `summary.days[].date` arrives as an ISO timestamp while a
 * calendar grid is built from local date parts, so the key has to be local too
 * — keying off the UTC parts would drop a charge into the neighbouring cell for
 * anyone whose offset crosses midnight. Same viewer-local convention as
 * `lib/dashboard/aggregate-by-month.ts`.
 *
 * `month` is 0-based, matching `Date.getMonth()`. The three parts are joined
 * with a separator that cannot appear inside them, so the key is collision-free
 * without zero-padding.
 */
export const dayKey = (year: number, month: number, day: number) =>
  `${year}-${month}-${day}`;

const keyOf = (date: Date) =>
  dayKey(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Folds `/api/summary`'s `days[]` into per-calendar-day totals plus the bounds
 * of the window they cover.
 *
 * `fillMissingDays` (`lib/utils.ts`) emits an entry for every day in
 * `[startDate, endDate]` once there is at least one active day, so the window
 * is exactly the set of keys — a caller does not have to re-derive it from the
 * URL filter and cannot drift from what the server actually answered.
 *
 * Totals are accumulated rather than overwritten. `/api/summary` groups by full
 * timestamp, so one calendar day is not guaranteed to arrive as a single row.
 * Both figures are already non-negative: the endpoint applies `ABS()` to the
 * expense sum.
 */
export function dailyTotals(rows: DailySummaryRow[]): DailyTotals {
  const byDay = new Map<string, DayTotals>();
  let start: Date | null = null;
  let end: Date | null = null;

  for (const row of rows) {
    const date = typeof row.date === "string" ? new Date(row.date) : row.date;

    // Unreachable from `/api/summary`, whose dates are database timestamps or
    // `eachDayOfInterval` output. Skipped rather than kept because an Invalid
    // Date compares false against everything: it would win the `start === null`
    // check, poison the window bounds for every other day, and reach `format()`
    // as a RangeError with no error boundary above the widget.
    if (Number.isNaN(date.getTime())) continue;

    const key = keyOf(date);
    const bucket = byDay.get(key) ?? { income: 0, expenses: 0 };
    bucket.income += row.income;
    bucket.expenses += row.expenses;
    byDay.set(key, bucket);

    if (start === null || date < start) start = date;
    if (end === null || date > end) end = date;
  }

  return { byDay, start, end };
}
