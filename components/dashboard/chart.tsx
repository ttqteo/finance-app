import { AreaVariant } from "@/components/dashboard/area-variant";
import { BarVariant } from "@/components/dashboard/bar-variant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChartIcon,
  BarChartIcon,
  FileSearchIcon,
  LineChartIcon,
  Loader2Icon,
} from "lucide-react";
import { useState } from "react";
import { LineVariant } from "@/components/dashboard/line-variant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

type Props = {
  data?: {
    date: string;
    income: number;
    expenses: number;
  }[];
};
export const Chart = ({ data = [] }: Props) => {
  const t = useTranslations("OverviewPage");
  const [chartType, setChartType] = useState("area");
  const onTypeChange = (type: string) => {
    // TODO: Add paywall
    setChartType(type);
  };
  return (
    <Card>
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <CardTitle className="text-xl line-clamp-1">
          {t("Transactions")}
        </CardTitle>
        <Select defaultValue={chartType} onValueChange={onTypeChange}>
          <SelectTrigger className="lg:w-auto h-9 px-3">
            <SelectValue placeholder="Chart Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="area">
              <div className="flex items-center">
                <AreaChartIcon className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">{t("AreaChart")}</p>
              </div>
            </SelectItem>
            <SelectItem value="line">
              <div className="flex items-center">
                <LineChartIcon className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">{t("LineChart")}</p>
              </div>
            </SelectItem>
            <SelectItem value="bar">
              <div className="flex items-center">
                <BarChartIcon className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">{t("BarChart")}</p>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {data?.length === 0 ? (
          <div className="flex flex-col gap-y-4 items-center justify-center h-[350px] w-full">
            <FileSearchIcon className="size-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">{t("NoData")}</p>
          </div>
        ) : (
          <>
            {chartType === "line" && <LineVariant data={data} />}
            {chartType === "area" && <AreaVariant data={data} />}
            {chartType === "bar" && <BarVariant data={data} />}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const ChartLoading = () => {
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 lg:w-[120px] w-full" />
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full flex items-center justify-center">
          <Loader2Icon className="h-6 w-6 text-slate-300 animate-spin" />
        </div>
      </CardContent>
    </Card>
  );
};
