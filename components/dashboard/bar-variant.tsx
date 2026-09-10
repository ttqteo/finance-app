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
  BarChart,
  Bar,
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

export const BarVariant = ({ data }: Props) => {
  const timezone = useTimezone();

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          axisLine={false}
          tickLine={false}
          dataKey="date"
          tickFormatter={(value) => formatInTz(value, "dd MMM", timezone)}
          style={{ fontSize: "12px" }}
          tickMargin={16}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="income" fill={CHART_SERIES.income} />
        <Bar dataKey="expenses" fill={CHART_SERIES.expenses} />
      </BarChart>
    </ResponsiveContainer>
  );
};
