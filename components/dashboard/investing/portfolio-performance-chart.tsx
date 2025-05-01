"use client";

import { LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { format, subMonths, subYears, isAfter } from "date-fns";

interface PortfolioPerformanceChartProps {
  data: { date: Date; value: number }[];
  timeRange: string;
}

export function PortfolioPerformanceChart({
  data,
  timeRange,
}: PortfolioPerformanceChartProps) {
  // Filter data based on time range
  const filteredData = (() => {
    const now = new Date();
    let cutoffDate: Date;

    switch (timeRange) {
      case "1M":
        cutoffDate = subMonths(now, 1);
        break;
      case "3M":
        cutoffDate = subMonths(now, 3);
        break;
      case "6M":
        cutoffDate = subMonths(now, 6);
        break;
      case "1Y":
        cutoffDate = subYears(now, 1);
        break;
      case "ALL":
      default:
        return data;
    }

    return data.filter((item) => isAfter(item.date, cutoffDate));
  })();

  // Calculate performance metrics
  const startValue = filteredData[0]?.value || 0;
  const endValue = filteredData[filteredData.length - 1]?.value || 0;
  const percentChange = ((endValue - startValue) / startValue) * 100;

  // Add S&P 500 benchmark data (mock data)
  const benchmarkData = filteredData.map((item, index) => {
    const benchmarkValue =
      startValue * (1 + (index / (filteredData.length - 1)) * 0.123); // 12.3% annual return
    return {
      ...item,
      benchmark: benchmarkValue,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-2xl font-bold">
            {percentChange >= 0 ? "+" : ""}
            {percentChange.toFixed(2)}%
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            ${(endValue - startValue).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-primary mr-2" />
            <span className="text-sm">Your Portfolio</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-muted-foreground mr-2" />
            <span className="text-sm">S&P 500</span>
          </div>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={benchmarkData}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                if (!value) return "";
                return format(
                  new Date(value),
                  timeRange === "1M" ? "MMM d" : "MMM yyyy"
                );
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
                if (
                  active &&
                  payload &&
                  payload.length &&
                  payload[0]?.payload
                ) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {format(new Date(data.date), "MMMM d, yyyy")}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <span className="text-xs font-bold text-muted-foreground">
                                Portfolio:
                              </span>
                            </div>
                            <span className="text-xs font-bold">
                              ${data.value.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                              <span className="text-xs font-bold text-muted-foreground">
                                S&P 500:
                              </span>
                            </div>
                            <span className="text-xs font-bold">
                              ${data.benchmark.toLocaleString()}
                            </span>
                          </div>
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
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <ReferenceLine
              y={startValue}
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
