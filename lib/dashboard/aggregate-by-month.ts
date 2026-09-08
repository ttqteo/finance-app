import { format, parseISO } from "date-fns";

export type MonthlyPoint = {
  month: string;
  name: string;
  Income: number;
  Expenses: number;
  Savings: number;
};

type Input = { date: string | Date; amount: number };

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
