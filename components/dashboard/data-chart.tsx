"use client";

import { Chart, ChartLoading } from "@/components/dashboard/chart";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import {
  SpendingPie,
  SpendingPieLoading,
} from "@/components/dashboard/spending-pie";
import { AlertTriangleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export const DataChart = () => {
  const t = useTranslations("OverviewPage");
  const { data, isLoading, isError } = useGetSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
        <div className="col-span-1 lg:col-span-3 xl:col-span-4">
          <ChartLoading />
        </div>
        <div className="col-span-1 lg:col-span-3 xl:col-span-2">
          <SpendingPieLoading />
        </div>
      </div>
    );
  }

  // Same reason as DataGrid: on failure the charts used to render with an
  // undefined series, i.e. an empty axis that reads as "you had no activity".
  if (isError) {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
        <AlertTriangleIcon className="size-6 text-destructive" />
        <p className="text-muted-foreground text-sm">{t("LoadFailed")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
      <div className="col-span-1 lg:col-span-3 xl:col-span-4">
        <Chart data={data?.days} />
      </div>
      <div className="col-span-1 lg:col-span-3 xl:col-span-2">
        <SpendingPie data={data?.categories} />
      </div>
    </div>
  );
};
