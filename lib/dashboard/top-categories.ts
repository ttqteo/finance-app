/**
 * Collapses a spending-by-category list into "the biggest few, plus Other".
 *
 * This used to live in `app/api/[[...route]]/summary.ts`, where it had two
 * problems that could only be fixed by moving it:
 *
 *  1. The query feeding it INNER JOINed `categories`, so every transaction with
 *     a NULL category_id was silently dropped. On the sample data that hid
 *     99.7% of expenses from the pie while the Expenses KPI directly above it
 *     counted them — two numbers on one screen that could not be reconciled.
 *  2. It labelled its overflow bucket `"Other"` in hardcoded English, on a
 *     server that has no access to the viewer's locale.
 *
 * Doing it here means the caller supplies both labels already translated, and
 * the API can return honest rows with `name: null` for "no category".
 */

export type RawCategory = { name: string | null; value: number };
export type LabelledCategory = { name: string; value: number };

export type CategoryLabels = {
  /** Shown for rows whose category_id is NULL. */
  uncategorized: string;
  /** Shown for the bucket holding everything past `limit`. */
  other: string;
};

export function topCategories(
  rows: RawCategory[],
  labels: CategoryLabels,
  limit = 3
): LabelledCategory[] {
  if (rows.length === 0) return [];

  // A LEFT JOIN grouped by category name yields a single NULL row, but callers
  // should not have to rely on that, so fold duplicates by resolved label.
  const totals = new Map<string, number>();
  for (const row of rows) {
    const name = row.name ?? labels.uncategorized;
    totals.set(name, (totals.get(name) ?? 0) + row.value);
  }

  const sorted = [...totals]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit);

  if (rest.length > 0) {
    top.push({
      name: labels.other,
      value: rest.reduce((sum, current) => sum + current.value, 0),
    });
  }

  return top;
}
