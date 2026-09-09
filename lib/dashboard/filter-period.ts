import { subDays } from "date-fns";

/**
 * The period the dashboard's DateFilter chip is showing, read from the URL.
 *
 * This block used to be copy-pasted into every widget that names its window in
 * an empty state. Collapsing it to one call site is also what the debt note on
 * the shared parsing bug asks for: `new Date("2025-05-13")` is UTC midnight, so
 * a viewer west of UTC sees the day before. That is still true here and is
 * deliberately left alone — the point is that it is now wrong in one place, so
 * the fix that note describes becomes a single edit instead of three that have
 * to land together.
 *
 * Note it cannot be replaced by calling `formatDateRange()` with no argument.
 * That function has the same 30-day fallback, but only reaches it when `from`
 * is absent, so it would report the last 30 days over a range the user had
 * actually picked. Verified across both locales: identical output when neither
 * param is set, different in all three other cases.
 *
 * `params` is structural so it takes both `URLSearchParams` and next's
 * `ReadonlyURLSearchParams` without dragging a framework type into `lib/`.
 */
export const filterPeriod = (params: { get(name: string): string | null }) => {
  const from = params.get("from");
  const to = params.get("to");

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  return {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  };
};
