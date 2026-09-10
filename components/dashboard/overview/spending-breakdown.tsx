"use client";

import { useMemo } from "react";
import { AlertTriangleIcon, FileSearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { filterPeriod } from "@/lib/dashboard/filter-period";
import { formatCurrency, formatDateRange } from "@/lib/utils";
import { CHART_RAMP } from "@/lib/dashboard/chart-colors";

// The summary endpoint returns at most four slices (top three categories plus
// an "Other" bucket); the modulo below is kept as cheap defence in case that
// changes.

export function SpendingBreakdown() {
  const t = useTranslations("OverviewPage");
  const params = useSearchParams();
  const { data: summary, isLoading, isError } = useGetSummary();

  const spendingData = useMemo(
    () =>
      (summary?.categories ?? []).map((c, i) => ({
        category: c.name,
        amount: Math.abs(c.value),
        color: CHART_RAMP[i % CHART_RAMP.length],
      })),
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

  if (spendingData.length === 0) {
    // Mirrors the range the DateFilter chip shows, so the empty copy names the
    // exact window the user is looking at.
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <FileSearchIcon className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          {t("NoSpending", { range: formatDateRange(filterPeriod(params)) })}
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={spendingData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 80,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={false}
          />
          <XAxis
            type="number"
            tickFormatter={(value) =>
              formatCurrency(Number(value), undefined, false)
            }
          />
          <YAxis type="category" dataKey="category" width={80} />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), t("Amount")]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
            }}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {spendingData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
