"use client";

import { useMemo } from "react";
import { FileSearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { formatCurrency } from "@/lib/utils";

const PALETTE = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#6b7280",
];

export function SpendingBreakdown() {
  const t = useTranslations("OverviewPage");
  const { data: summary, isLoading } = useGetSummary();

  const spendingData = useMemo(
    () =>
      (summary?.categories ?? []).map((c, i) => ({
        category: c.name,
        amount: Math.abs(c.value),
        color: PALETTE[i % PALETTE.length],
      })),
    [summary]
  );

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (spendingData.length === 0) {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <FileSearchIcon className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{t("NoData")}</p>
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
