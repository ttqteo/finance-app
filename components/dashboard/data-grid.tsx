"use client";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { DataCard, DataCardLoading } from "./data-card";

export const DataGrid = () => {
  const t = useTranslations("OverviewPage");

  const { data, isLoading } = useGetSummary();
  const params = useSearchParams();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <DataCard
        title={t("Remaining")}
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
      />
      <DataCard
        title={t("Income")}
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
      />
      <DataCard
        title={t("Expenses")}
        value={data?.expensesAmount}
        percentageChange={data?.expensesChange}
      />
      <DataCard title="Đầu Tư" value={12580000} percentageChange={10} />
    </div>
  );
};
