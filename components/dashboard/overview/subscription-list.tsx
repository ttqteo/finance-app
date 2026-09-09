"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { AlertTriangleIcon, Check, FileSearchIcon, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetSubscriptions } from "@/features/subscriptions/api/use-get-subscriptions";
import { isYearly, nextPaymentDate } from "@/lib/dashboard/next-payment-date";
import { formatCurrency, getLocale } from "@/lib/utils";

export function SubscriptionList() {
  const t = useTranslations("OverviewPage");
  const { data: subscriptions, isLoading, isError } = useGetSubscriptions();

  // Yearly plans are divided by twelve so every row contributes a comparable
  // monthly figure. Currencies are totalled separately: `subscriptions.currency`
  // is per row, so folding a VND plan into a USD one would invent a number.
  const monthlyTotals = useMemo(() => {
    const totals = new Map<string, number>();

    for (const s of subscriptions ?? []) {
      const perMonth = isYearly(s.frequency) ? s.amount / 12 : s.amount;
      totals.set(s.currency, (totals.get(s.currency) ?? 0) + perMonth);
    }

    // Sorted by currency code: Map iteration follows insertion order, which
    // here is the endpoint's `orderBy(desc(createdAt))`, so adding a
    // subscription would otherwise silently reshuffle the totals.
    return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [subscriptions]);

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

  const rows = subscriptions ?? [];

  if (rows.length === 0) {
    // Unlike the other widgets this copy names no period on purpose:
    // `/api/subscriptions` ignores the dashboard's `from`/`to` filter and always
    // returns every subscription the user owns.
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <FileSearchIcon className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{t("NoSubscriptions")}</p>
      </div>
    );
  }

  // Both read cookies, so they stay below the early returns like the other
  // widgets on this page.
  const { locale, formatNormal } = getLocale();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("TotalMonthlyCost")}</span>
        <div className="flex flex-col items-end">
          {monthlyTotals.map(([currency, total]) => (
            <span key={currency} className="text-sm font-bold">
              {formatCurrency(total, currency)}
            </span>
          ))}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("Name")}</TableHead>
            <TableHead className="text-right">{t("Amount")}</TableHead>
            <TableHead className="text-right">{t("NextBilling")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {subscription.name}
                  {subscription.hasFreeTrial && (
                    <Badge
                      variant="outline"
                      className="h-5 border-green-500 text-green-500"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      {t("FreeTrial")}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div>
                  {formatCurrency(subscription.amount, subscription.currency)}
                </div>
                {/* The card wrapping this widget is titled "monthly payments",
                    so a yearly plan has to say so or its amount reads as a
                    monthly charge. */}
                <div className="text-xs text-muted-foreground">
                  {isYearly(subscription.frequency)
                    ? t("PerYear")
                    : t("PerMonth")}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {format(
                  nextPaymentDate(
                    new Date(subscription.startDate),
                    subscription.frequency
                  ),
                  formatNormal,
                  { locale }
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end">
        <Link
          href="/dashboard/subscriptions"
          className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Info className="mr-1 h-3 w-3" />
          {t("ManageSubscriptions")}
        </Link>
      </div>
    </div>
  );
}
