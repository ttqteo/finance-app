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
  Legend,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetTransactionsRange } from "@/features/transactions/api/use-get-transactions-range";
import { aggregateByMonth } from "@/lib/dashboard/aggregate-by-month";
import { formatCurrency } from "@/lib/utils";

export function ExpenseChart() {
  const t = useTranslations("OverviewPage");
  const { data: transactions, isLoading } = useGetTransactionsRange(12);
  const data = useMemo(() => aggregateByMonth(transactions ?? []), [transactions]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[300px] w-full">
        <FileSearchIcon className="size-6 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{t("NoTransactions12m")}</p>
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
          <Bar dataKey="Income" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
