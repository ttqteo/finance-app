"use client";

import { useTimezone } from "@/features/settings/hooks/use-timezone";
import { formatInTz } from "@/lib/format-date";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CustomTooltip } from "@/components/dashboard/custom-tooltip";
import { CHART_SERIES } from "@/lib/dashboard/chart-colors";

type Props = {
  data: {
    date: string;
    income: number;
    expenses: number;
  }[];
};

export const AreaVariant = ({ data }: Props) => {
  const timezone = useTimezone();

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <defs>
          <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor={CHART_SERIES.income} stopOpacity={0.8} />
            <stop offset="98%" stopColor={CHART_SERIES.income} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="2%" stopColor={CHART_SERIES.expenses} stopOpacity={0.8} />
            <stop offset="98%" stopColor={CHART_SERIES.expenses} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date"
          tickFormatter={(value) => formatInTz(value, "dd MMM", timezone)}
          style={{ fontSize: "12px" }}
          tickMargin={16}
        />
        <Area
          type="monotone"
          dataKey="income"
          stackId={"income"}
          strokeWidth={2}
          stroke={CHART_SERIES.income}
          fill="url(#income)"
          className="drop-shadow-sm"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="expenses"
          stackId={"expenses"}
          strokeWidth={2}
          stroke={CHART_SERIES.expenses}
          fill="url(#expenses)"
          className="drop-shadow-sm"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
