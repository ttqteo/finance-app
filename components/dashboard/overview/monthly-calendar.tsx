"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  differenceInCalendarMonths,
  format,
  startOfMonth,
} from "date-fns";
import {
  AlertTriangleIcon,
  ChevronLeft,
  ChevronRight,
  FileSearchIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { dailyTotals, dayKey } from "@/lib/dashboard/daily-totals";
import { filterPeriod } from "@/lib/dashboard/filter-period";
import { cn, formatCurrency, formatDateRange, getLocale } from "@/lib/utils";

// Weekday headings, not data: the summary endpoint has nothing to say about
// these, so they stay hardcoded.
const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const currentDate = new Date();
const currentDay = currentDate.getDate();

export function MonthlyCalendar() {
  const t = useTranslations("OverviewPage");
  const params = useSearchParams();
  const { data: summary, isLoading, isError } = useGetSummary();

  // Offset in months from the LAST month of the queried window: 0 is that
  // month, -1 the one before it. Anchoring to the data rather than to today
  // means a filter change cannot strand this state outside the window — the
  // clamp below is computed from whatever `days[]` currently covers.
  const [monthOffset, setMonthOffset] = useState(0);

  const { byDay, start, end } = useMemo(
    () => dailyTotals(summary?.days ?? []),
    [summary]
  );

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <AlertTriangleIcon className="size-6 text-destructive" />
        <p className="text-muted-foreground text-sm">{t("LoadFailed")}</p>
      </div>
    );
  }

  if (byDay.size === 0 || !start || !end) {
    // `fillMissingDays` returns an empty array when the period has no
    // transactions at all, so an empty map means exactly that. Mirrors the
    // range the DateFilter chip shows, like the sibling widgets.
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <FileSearchIcon className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          {t("NoTransactions", { range: formatDateRange(filterPeriod(params)) })}
        </p>
      </div>
    );
  }

  // Reads cookies, so it stays below the early returns like the other widgets
  // on this page.
  const { locale } = getLocale();

  // Paging is bounded by the window `/api/summary` actually answered for.
  // `useGetSummary` covers the dashboard's date filter and nothing else, so
  // letting the user page past its edges would render months this widget never
  // asked about as months in which nothing happened.
  const firstMonth = startOfMonth(start);
  const lastMonth = startOfMonth(end);
  const monthSpan = differenceInCalendarMonths(lastMonth, firstMonth) + 1;

  const offset = Math.min(0, Math.max(-(monthSpan - 1), monthOffset));
  const visibleMonth = addMonths(lastMonth, offset);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const canGoBack = offset > -(monthSpan - 1);
  const canGoForward = offset < 0;

  // Stepping from the clamped value, not from state, so a filter change that
  // shrank the window cannot leave the buttons needing several clicks to have
  // any visible effect.
  const handlePrevMonth = () => setMonthOffset(offset - 1);
  const handleNextMonth = () => setMonthOffset(offset + 1);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthLabel = format(visibleMonth, "LLLL yyyy", { locale });

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          disabled={!canGoBack}
          aria-label={t("PreviousMonth")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-medium">{monthLabel}</h3>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          disabled={!canGoForward}
          aria-label={t("NextMonth")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-8 rounded-md p-1" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;

          // Present in the map iff the day fell inside the queried window. A
          // day the filter excluded is dimmed and labelled, never drawn as a
          // quiet day — those are different facts.
          const totals = byDay.get(dayKey(year, month, day));
          const inWindow = totals !== undefined;

          const income = totals?.income ?? 0;
          const expenses = totals?.expenses ?? 0;
          const hasIncome = income > 0;
          const hasExpenses = expenses > 0;
          const hasActivity = hasIncome || hasExpenses;

          const isToday =
            inWindow &&
            day === currentDay &&
            month === currentDate.getMonth() &&
            year === currentDate.getFullYear();

          const title = inWindow
            ? [
                hasIncome ? `${t("Income")}: ${formatCurrency(income)}` : null,
                hasExpenses
                  ? `${t("Expenses")}: ${formatCurrency(expenses)}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : t("NotInPeriod");

          return (
            <div
              key={day}
              className={cn(
                "relative h-8 rounded-md p-1 text-center text-xs",
                isToday
                  ? "bg-primary text-primary-foreground"
                  : hasActivity
                  ? "bg-muted"
                  : "",
                !inWindow && "text-muted-foreground/40"
              )}
              title={title}
            >
              <span className="font-medium">{day}</span>
              {hasActivity && (
                <div className="absolute bottom-0 left-0 right-0 flex h-1 overflow-hidden rounded-full">
                  {hasIncome && <div className="flex-1 bg-green-500" />}
                  {hasExpenses && <div className="flex-1 bg-red-500" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
