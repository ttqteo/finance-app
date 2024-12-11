import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileSearchIcon,
  Loader2Icon,
  PieChartIcon,
  RadarIcon,
  TargetIcon,
} from "lucide-react";
import { useState } from "react";
import { PieVariant } from "@/components/pie-variant";
import { RadarVariant } from "@/components/radar-variant";
import { RadialVariant } from "@/components/radial-variant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { useTranslations } from "next-intl";

type Props = {
  data?: {
    name: string;
    value: number;
  }[];
};
export const SpendingPie = ({ data = [] }: Props) => {
  const t = useTranslations("OverviewPage");
  const [chartType, setChartType] = useState("pie");
  const onTypeChange = (type: string) => {
    // TODO: Add paywall
    setChartType(type);
  };
  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="flex space-y-2 lg:space-y-0 lg:flex-row lg:items-center justify-between">
        <CardTitle className="text-xl line-clamp-1">
          {t("Categories")}
        </CardTitle>
        <Select defaultValue={chartType} onValueChange={onTypeChange}>
          <SelectTrigger className="lg:w-auto h-9 rounded-md px-3">
            <SelectValue placeholder="Chart Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pie">
              <div className="flex items-center">
                <PieChartIcon className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">{t("PieChart")}</p>
              </div>
            </SelectItem>
            <SelectItem value="radar">
              <div className="flex items-center">
                <RadarIcon className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">{t("RadarChart")}</p>
              </div>
            </SelectItem>
            <SelectItem value="radial">
              <div className="flex items-center">
                <TargetIcon className="size-4 mr-2 shrink-0" />
                <p className="line-clamp-1">{t("RadialChart")}</p>
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
            {chartType === "pie" && <PieVariant data={data} />}
            {chartType === "radar" && <RadarVariant data={data} />}
            {chartType === "radial" && <RadialVariant data={data} />}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const SpendingPieLoading = () => {
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
