import { subDays } from "date-fns";

/**
 * The dashboard's default window: the last 30 days, ending now.
 *
 * Exported separately because `date-filter.tsx` also needs it on its own — it
 * writes this range to the URL when the user resets the filter. Without this
 * export that file would have to keep its own copy of the arithmetic, and
 * routing its `paramState` through `filterPeriod` would have removed nothing.
 */
export const defaultPeriod = () => {
  const to = new Date();
  return { from: subDays(to, 30), to };
};

/**
 * The period the dashboard's DateFilter chip is showing, read from the URL.
 *
 * This block used to be copy-pasted into the filter itself and into every
 * widget that names its window in an empty state. Collapsing it is also what
 * the debt note on the shared parsing bug asks for: `new Date("2025-05-13")` is
 * UTC midnight, so a viewer west of UTC sees the day before. That is still true
 * on the line below and is deliberately left alone — the point is that this is
 * now the only client-side copy of that parse, so the fix that note describes
 * is a single edit instead of four that have to land together.
 *
 * Out of scope, and therefore not counted above: `app/api/**` parses the same
 * two params server-side, and `formatDateRange` carries its own 30-day
 * fallback. Neither file may be modified by this plan.
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
  const fallback = defaultPeriod();

  return {
    from: from ? new Date(from) : fallback.from,
    to: to ? new Date(to) : fallback.to,
  };
};
