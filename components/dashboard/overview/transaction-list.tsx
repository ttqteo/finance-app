"use client";

import {
  AlertTriangleIcon,
  ArrowDownRight,
  ArrowUpRight,
  FileSearchIcon,
} from "lucide-react";
import { useTimezone } from "@/features/settings/hooks/use-timezone";
import { formatInTz } from "@/lib/format-date";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetTransactions } from "@/features/transactions/api/use-get-transtractions";
import { filterPeriod } from "@/lib/dashboard/filter-period";
import { formatCurrency, formatDateRange, getLocale } from "@/lib/utils";

interface TransactionListProps {
  extended?: boolean;
  limit?: number;
}

export function TransactionList({
  extended = false,
  limit = 5,
}: TransactionListProps) {
  const t = useTranslations("OverviewPage");
  const params = useSearchParams();
  const timezone = useTimezone();
  const { data: transactions, isLoading, isError } = useGetTransactions();

  // Limit the number of transactions shown unless extended view
  const displayTransactions = extended
    ? transactions ?? []
    : (transactions ?? []).slice(0, limit);

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

  if (displayTransactions.length === 0) {
    // Mirrors the range the DateFilter chip shows, so the empty copy names the
    // exact window the user is looking at.
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <FileSearchIcon className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          {t("NoTransactions", { range: formatDateRange(filterPeriod(params)) })}
        </p>
      </div>
    );
  }

  const { locale, formatNormal } = getLocale();

  return (
    <div className="space-y-4">
      {displayTransactions.map((transaction) => {
        const isIncome = transaction.amount >= 0;
        const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

        return (
          <div key={transaction.id} className="flex items-center gap-4">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                isIncome
                  ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {transaction.payee}
              </p>
              <p className="text-sm text-muted-foreground">
                {transaction.account} •{" "}
                {formatInTz(transaction.date, formatNormal, timezone, locale)}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-medium leading-none ${
                  isIncome ? "text-green-600" : "text-red-600"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(Math.abs(transaction.amount))}
              </p>
              {extended && (
                <p className="text-sm text-muted-foreground">
                  {transaction.category ?? t("Uncategorized")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
