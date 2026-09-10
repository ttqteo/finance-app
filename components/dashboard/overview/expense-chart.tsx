"use client";
import { useMemo } from "react";
import { format } from "date-fns";
import { AlertTriangleIcon, FileSearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import {
  transactionsRangeFor,
  useGetTransactionsRange,
} from "@/features/transactions/api/use-get-transactions-range";
import { aggregateByMonth } from "@/lib/dashboard/aggregate-by-month";
import { formatCurrency, getLocale } from "@/lib/utils";
import { CHART_SERIES } from "@/lib/dashboard/chart-colors";

const MONTHS = 12;

export function ExpenseChart() {
  const t = useTranslations("OverviewPage");
  const { data: transactions, isLoading, isError } =
    useGetTransactionsRange(MONTHS);
  const data = useMemo(() => aggregateByMonth(transactions ?? []), [transactions]);

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

  if (data.length === 0) {
    // Names the window the chart actually queried, like the sibling widgets
    // name theirs. `getLocale` reads cookies, so it stays below the early
    // returns above.
    //
    // Built here rather than with `formatDateRange`, which prints the year on
    // the end date only. That is fine for the 30-day filter the other widgets
    // report, but this window always crosses a year boundary, so
    // "Oct 01 - Sep 09, 2026" would read as an impossible range.
    const { locale, formatStringFull } = getLocale();
    const { from, to } = transactionsRangeFor(MONTHS);
    const range = `${format(from, formatStringFull, { locale })} - ${format(
      to,
      formatStringFull,
      { locale }
    )}`;

    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <FileSearchIcon className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          {t("NoTransactions", { range })}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => {
              if (
                name === "Income" ||
                name === "Expenses" ||
                name === "Savings"
              ) {
                return [formatCurrency(Number(value)), name];
              }
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
          <Bar dataKey="Income" fill={CHART_SERIES.income} radius={[2, 2, 0, 0]} />
          <Bar dataKey="Expenses" fill={CHART_SERIES.expenses} radius={[2, 2, 0, 0]} />
          <Bar dataKey="Savings" fill={CHART_SERIES.savings} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
