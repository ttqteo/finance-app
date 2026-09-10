import { CountUp } from "@/components/dashboard/count-up";
import { Card } from "@/components/ui/card";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

interface DataCardProps {
  title: string;
  value?: number;
  percentageChange?: number;
  icon?: LucideIcon;
  /** Rendered as the muted footer link, the way Midday ends each card. */
  href?: string;
  actionLabel?: string;
}

/**
 * Midday's card anatomy: a small muted icon+label at the top, the figure set
 * large but at *normal* weight, and a quiet action link pinned to the bottom.
 * The old card led with a bold 2xl number and had nowhere to go from it.
 */
export const DataCard = ({
  title,
  value = 0,
  percentageChange = 0,
  icon: Icon,
  href,
  actionLabel,
}: DataCardProps) => {
  const t = useTranslations();

  return (
    <Card className="flex min-h-[190px] flex-col justify-between p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />}
        <span className="line-clamp-1 text-xs font-medium">{title}</span>
      </div>

      <div className="mt-6">
        <div className="line-clamp-1 break-all text-3xl font-normal tabular-nums tracking-tight">
          <CountUp
            preserveValue
            start={value / 2}
            end={value}
            decimals={2}
            decimalPlaces={2}
            formattingFn={formatCurrency}
          />
        </div>
        <div className="mt-2 flex items-center text-xs">
          {/* The arrow carries the direction on its own, so this still reads
              in greyscale — the tint is a second channel, not the only one. */}
          {percentageChange > 0 ? (
            <ArrowUp className="mr-1 size-3.5 shrink-0" strokeWidth={2} />
          ) : (
            <ArrowDown className="mr-1 size-3.5 shrink-0" strokeWidth={2} />
          )}
          <span
            className={cn(
              "font-medium",
              percentageChange > 0 && "text-emerald-600 dark:text-emerald-500",
              percentageChange < 0 && "text-rose-600 dark:text-rose-500",
              percentageChange === 0 && "text-muted-foreground"
            )}
          >
            {formatPercentage(percentageChange, { addPrefix: true })}
          </span>
          <span className="ml-1 text-muted-foreground">
            {t("OverviewPage.FromLastPeriod")}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t pt-3">
        {href && actionLabel ? (
          <Link
            href={href}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {actionLabel}
          </Link>
        ) : (
          // Keeps every card the same height whether or not it has somewhere
          // to send you.
          <span className="block h-4" aria-hidden />
        )}
      </div>
    </Card>
  );
};

export const DataCardLoading = () => {
  return (
    <Card className="flex min-h-[190px] flex-col justify-between p-5">
      <Skeleton className="h-3 w-20" />
      <div className="mt-6 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="mt-6 border-t pt-3">
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  );
};
