/**
 * One source of truth for chart colour.
 *
 * Every chart used to carry its own hardcoded hex — `#3d82f6`/`#f42f5e` in the
 * income/expense variants, a different `#0062FF` set in the pie and radial, and
 * a third five-hue `PALETTE` in the spending breakdown. Fixed hex does not
 * follow the theme, so those charts kept their light-mode colours on a dark
 * canvas.
 *
 * These read the `--chart-N` tokens instead, which were defined in globals.css
 * but never consumed by anything. The tokens are a neutral ramp, so series are
 * told apart by *value* rather than hue — the Midday reference has no colour in
 * its charts at all.
 */

/** Named series, spaced far enough apart on the ramp to stay distinguishable. */
export const CHART_SERIES = {
  income: "hsl(var(--chart-1))",
  expenses: "hsl(var(--chart-3))",
  savings: "hsl(var(--chart-5))",
} as const;

/** Ordered ramp for categorical charts; index with `i % CHART_RAMP.length`. */
export const CHART_RAMP = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const;
