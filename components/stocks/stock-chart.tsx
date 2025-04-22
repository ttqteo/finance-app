"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
// import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for the chart
const data = [
  { date: new Date(2023, 0, 1), value: 35000 },
  { date: new Date(2023, 1, 1), value: 36500 },
  { date: new Date(2023, 2, 1), value: 38000 },
  { date: new Date(2023, 3, 1), value: 37500 },
  { date: new Date(2023, 4, 1), value: 39000 },
  { date: new Date(2023, 5, 1), value: 41000 },
  { date: new Date(2023, 6, 1), value: 42500 },
  { date: new Date(2023, 7, 1), value: 44000 },
  { date: new Date(2023, 8, 1), value: 43500 },
  { date: new Date(2023, 9, 1), value: 45000 },
  { date: new Date(2023, 10, 1), value: 45231.89 },
];

export function StockChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-muted"
        />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            if (!value) return "";
            return format(new Date(value), "MMM");
          }}
          tickLine={false}
          axisLine={false}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis
          width={80}
          tickFormatter={(value) => `${value?.toLocaleString() || 0}`}
          tickLine={false}
          axisLine={false}
          tickCount={6}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length && payload[0]?.payload) {
              const data = payload[0].payload;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {format(new Date(data.date), "MMMM yyyy")}
                      </span>
                      <span className="text-xs font-bold">
                        ${data.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, style: { fill: "hsl(var(--primary))" } }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
