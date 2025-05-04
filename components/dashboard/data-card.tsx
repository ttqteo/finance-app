import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { IconType } from "react-icons/lib";
import { CountUp } from "@/components/dashboard/count-up";
import { Skeleton } from "../ui/skeleton";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp } from "lucide-react";

interface DataCardProps {
  title: string;
  value?: number;
  percentageChange?: number;
}
export const DataCard = ({
  title,
  value = 0,
  percentageChange = 0,
}: DataCardProps) => {
  const t = useTranslations();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium line-clamp-1">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-bold text-2xl mb-2 line-clamp-1 break-all">
          <CountUp
            preserveValue
            start={value / 2}
            end={value}
            decimals={2}
            decimalPlaces={2}
            formattingFn={formatCurrency}
          />
        </div>
        <div
          className={cn(
            "flex items-center text-xs",
            percentageChange > 0 && "text-emerald-500",
            percentageChange < 0 && "text-rose-500"
          )}
        >
          {percentageChange > 0 ? (
            <ArrowUp className="mr-1 h-4 w-4" />
          ) : (
            <ArrowDown className="mr-1 h-4 w-4" />
          )}
          {formatPercentage(percentageChange, { addPrefix: true })}{" "}
          <span className="ml-1 text-muted-foreground">
            {t("OverviewPage.FromLastPeriod")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const DataCardLoading = () => {
  return (
    <Card className="h-[192px]">
      <CardHeader className="flex flex-row items-center justify-between gap-x-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="size-12" />
      </CardHeader>
      <CardContent>
        <Skeleton className="shrink-0 h-10 w-24 mb-2" />
        <Skeleton className="shrink-0 h-4 w-40" />
      </CardContent>
    </Card>
  );
};
