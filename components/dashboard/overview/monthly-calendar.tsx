"use client";

import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
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
import { cn, formatCurrency, formatDateRange, getLocale } from "@/lib/utils";

// Weekday headings, not data: the summary endpoint has nothing to say about
// these, so they stay hardcoded.
const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const currentDate = new Date();
const currentDay = currentDate.getDate();

// `summary.days[].date` arrives as an ISO timestamp while the grid below is
// built from local date parts, so the key has to be local too — keying off the
// UTC parts would drop a charge into the neighbouring cell for anyone whose
// offset crosses midnight. Same viewer-local convention as
// `lib/dashboard/aggregate-by-month.ts`.
const dayKey = (year: number, month: number, day: number) =>
  `${year}-${month}-${day}`;

export function MonthlyCalendar() {
  const t = useTranslations("OverviewPage");
  const params = useSearchParams();
  const { data: summary, isLoading, isError } = useGetSummary();

  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());

  const totalsByDay = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number }>();

    for (const day of summary?.days ?? []) {
      const date = new Date(day.date);
      const key = dayKey(date.getFullYear(), date.getMonth(), date.getDate());
      const bucket = map.get(key) ?? { income: 0, expenses: 0 };

      // Accumulated rather than overwritten: `/api/summary` groups by full
      // timestamp, so a calendar day is not guaranteed to arrive as one row.
      bucket.income += day.income;
      bucket.expenses += day.expenses;
      map.set(key, bucket);
    }

    return map;
  }, [summary]);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

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

  if (totalsByDay.size === 0) {
    // `fillMissingDays` returns an empty array when the period has no
    // transactions at all, so an empty map means exactly that. Mirrors the
    // range the DateFilter chip shows, like the sibling widgets.
    const from = params.get("from");
    const to = params.get("to");
    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <FileSearchIcon className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          {t("NoTransactions", {
            range: formatDateRange({
              from: from ? new Date(from) : defaultFrom,
              to: to ? new Date(to) : defaultTo,
            }),
          })}
        </p>
      </div>
    );
  }

  // Reads cookies, so it stays below the early returns like the other widgets
  // on this page.
  const { locale } = getLocale();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthLabel = format(new Date(year, month, 1), "LLLL yyyy", { locale });

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-medium">{monthLabel}</h3>
        <Button variant="outline" size="icon" onClick={handleNextMonth}>
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
          const isToday =
            day === currentDay &&
            month === currentDate.getMonth() &&
            year === currentDate.getFullYear();

          const totals = totalsByDay.get(dayKey(year, month, day));
          const income = totals?.income ?? 0;
          const expenses = totals?.expenses ?? 0;
          const hasIncome = income > 0;
          const hasExpenses = expenses > 0;
          const hasActivity = hasIncome || hasExpenses;

          const title = [
            hasIncome ? `${t("Income")}: ${formatCurrency(income)}` : null,
            hasExpenses ? `${t("Expenses")}: ${formatCurrency(expenses)}` : null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <div
              key={day}
              className={cn(
                "relative h-8 rounded-md p-1 text-center text-xs",
                isToday
                  ? "bg-primary text-primary-foreground"
                  : hasActivity
                  ? "bg-muted"
                  : ""
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
