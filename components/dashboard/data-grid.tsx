"use client";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import {
  AlertTriangleIcon,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { DataCard, DataCardLoading } from "./data-card";

export const DataGrid = () => {
  const t = useTranslations("OverviewPage");

  const { data, isLoading, isError } = useGetSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  // Without this branch a failed request fell through to the success markup
  // with `data` undefined, so the cards rendered a confident 0 and 0% — the
  // failure looked like a real balance of nothing.
  if (isError) {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[180px] w-full">
        <AlertTriangleIcon className="size-6 text-destructive" />
        <p className="text-muted-foreground text-sm">{t("LoadFailed")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <DataCard
        title={t("Remaining")}
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
        icon={Wallet}
      />
      <DataCard
        title={t("Income")}
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
        icon={TrendingUp}
        href="/dashboard/transactions"
        actionLabel={t("ViewAll")}
      />
      <DataCard
        title={t("Expenses")}
        value={data?.expensesAmount}
        percentageChange={data?.expensesChange}
        icon={TrendingDown}
        href="/dashboard/transactions"
        actionLabel={t("ViewAll")}
      />
    </div>
  );
};
