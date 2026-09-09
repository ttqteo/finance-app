"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { AlertTriangleIcon, CalendarClock, FileSearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSubscriptions } from "@/features/subscriptions/api/use-get-subscriptions";
import { nextPaymentDate } from "@/lib/dashboard/next-payment-date";
import { cn, formatCurrency, getLocale } from "@/lib/utils";

// The urgency bar covers a 30-day horizon: a charge further out than that reads
// as 0% and one due today as 100%. Yearly plans sit at 0 for most of the year,
// which is the intended meaning — the colour thresholds below use the same
// scale, so bar and colour never disagree.
const HORIZON_DAYS = 30;

export function UpcomingPayments() {
  const t = useTranslations("OverviewPage");
  const { data: subscriptions, isLoading, isError } = useGetSubscriptions();

  // There is no payments table: every upcoming charge is a subscription's next
  // billing date.
  const upcoming = useMemo(
    () =>
      (subscriptions ?? [])
        .map((s) => ({
          ...s,
          dueDate: nextPaymentDate(new Date(s.startDate), s.frequency),
        }))
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 5),
    [subscriptions]
  );

  // Currencies are totalled separately; adding a VND charge to a USD one would
  // invent a number.
  const totals = useMemo(() => {
    const byCurrency = new Map<string, number>();

    for (const p of upcoming) {
      byCurrency.set(p.currency, (byCurrency.get(p.currency) ?? 0) + p.amount);
    }

    return [...byCurrency.entries()];
  }, [upcoming]);

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

  if (upcoming.length === 0) {
    // These are derived from subscriptions, which `/api/subscriptions` returns
    // in full regardless of the dashboard's date filter, so the copy names no
    // period.
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <FileSearchIcon className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          {t("NoUpcomingPayments")}
        </p>
      </div>
    );
  }

  // Both read cookies, so they stay below the early returns like the other
  // widgets on this page.
  const { locale, formatNormal } = getLocale();
  const now = new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("TotalUpcoming")}</span>
        <div className="flex flex-col items-end">
          {totals.map(([currency, total]) => (
            <span key={currency} className="text-sm font-bold">
              {formatCurrency(total, currency)}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {upcoming.map((payment) => {
          const daysLeft = Math.max(
            0,
            differenceInCalendarDays(payment.dueDate, now)
          );
          const elapsed = Math.min(
            100,
            Math.max(0, 100 - (daysLeft / HORIZON_DAYS) * 100)
          );

          return (
            <div key={payment.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{payment.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {formatCurrency(payment.amount, payment.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {format(payment.dueDate, formatNormal, { locale })}
                </span>
                <span
                  className={
                    daysLeft <= 3
                      ? "text-red-500 font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {t("DaysLeft", { days: daysLeft })}
                </span>
              </div>

              <Progress
                value={elapsed}
                className={cn(
                  "h-1",
                  daysLeft <= 3
                    ? "bg-red-500"
                    : daysLeft <= 7
                    ? "bg-orange-500"
                    : "bg-green-500"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
