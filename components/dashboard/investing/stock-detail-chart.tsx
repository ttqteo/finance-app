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

// Generate mock data for different time ranges
const generateMockData = (timeRange: string) => {
  const now = new Date();
  const data = [];

  let startDate: Date;
  let interval: number;

  switch (timeRange) {
    case "1D":
      startDate = new Date(now);
      startDate.setHours(9, 30, 0, 0);
      interval = 30; // 30 minutes
      for (let i = 0; i < 14; i++) {
        const date = new Date(startDate);
        date.setMinutes(date.getMinutes() + i * interval);
        data.push({
          date,
          price: 175.5 + (Math.random() * 2 - 1) * (i / 14),
        });
      }
      break;
    case "1W":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        data.push({
          date,
          price: 175.5 + (Math.random() * 4 - 2) * (i / 7),
        });
      }
      break;
    case "1M":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        data.push({
          date,
          price: 175.5 + (Math.random() * 10 - 5) * (i / 30),
        });
      }
      break;
    case "3M":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 7);
        data.push({
          date,
          price: 175.5 + (Math.random() * 15 - 7.5) * (i / 12),
        });
      }
      break;
    case "6M":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      for (let i = 0; i < 6; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        data.push({
          date,
          price: 175.5 + (Math.random() * 20 - 10) * (i / 6),
        });
      }
      break;
    case "1Y":
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      for (let i = 0; i < 12; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        data.push({
          date,
          price: 175.5 + (Math.random() * 30 - 15) * (i / 12),
        });
      }
      break;
    case "5Y":
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 5);
      for (let i = 0; i < 20; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i * 3);
        data.push({
          date,
          price: 175.5 + (Math.random() * 50 - 25) * (i / 20),
        });
      }
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        data.push({
          date,
          price: 175.5 + (Math.random() * 10 - 5) * (i / 30),
        });
      }
  }

  return data;
};

// Format date based on time range
const formatDate = (date: Date, timeRange: string) => {
  if (!date) return "";

  switch (timeRange) {
    case "1D":
      return format(date, "h:mm a");
    case "1W":
      return format(date, "EEE");
    case "1M":
      return format(date, "MMM d");
    case "3M":
    case "6M":
      return format(date, "MMM d");
    case "1Y":
      return format(date, "MMM yyyy");
    case "5Y":
      return format(date, "MMM yyyy");
    default:
      return format(date, "MMM d");
  }
};

export function StockDetailChart({ timeRange }: { timeRange: string }) {
  const data = generateMockData(timeRange || "1M");

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
            return formatDate(new Date(value), timeRange);
          }}
          tickLine={false}
          axisLine={false}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis
          width={80}
          tickFormatter={(value) => `${value?.toFixed(2) || 0}`}
          tickLine={false}
          axisLine={false}
          domain={["dataMin - 5", "dataMax + 5"]}
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
                        {formatDate(new Date(data.date), timeRange)}
                      </span>
                      <span className="text-xs font-bold">
                        ${data.price.toFixed(2)}
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
          dataKey="price"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, style: { fill: "hsl(var(--primary))" } }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
