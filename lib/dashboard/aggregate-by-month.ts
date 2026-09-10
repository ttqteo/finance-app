import { format, parseISO } from "date-fns";

export type MonthlyPoint = {
  month: string;
  name: string;
  Income: number;
  Expenses: number;
  Savings: number;
};

type Input = { date: string | Date; amount: number };

/**
 * Buckets transactions into calendar months.
 *
 * NOTE: bucketing is intentionally VIEWER-LOCAL. Do not "fix" this to UTC.
 * `transactions.date` is a `timestamp` without time zone, Drizzle reads the
 * naked literal as UTC, and the write path stores local midnight. So a row
 * that reads `2025-05-31T17:00:00Z` really IS 1 June for a UTC+7 user, and
 * formatting in UTC would shift every row back a day.
 *
 * The real fix is a fixed application time zone (date-fns-tz) or a schema
 * change; both touch the write path, so they are tracked separately.
 */
export function aggregateByMonth(transactions: Input[]): MonthlyPoint[] {
  const buckets = new Map<string, { Income: number; Expenses: number }>();

  for (const t of transactions) {
    const d = typeof t.date === "string" ? parseISO(t.date) : t.date;
    const key = format(d, "yyyy-MM");
    const bucket = buckets.get(key) ?? { Income: 0, Expenses: 0 };

    if (t.amount >= 0) bucket.Income += t.amount;
    else bucket.Expenses += Math.abs(t.amount);

    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      name: format(parseISO(`${month}-01`), "MMM"),
      Income: v.Income,
      Expenses: v.Expenses,
      Savings: v.Income - v.Expenses,
    }));
}
