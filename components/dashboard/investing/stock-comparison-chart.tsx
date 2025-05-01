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
import { format, subMonths, subYears } from "date-fns";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  profitLossPercent: number;
  value: number;
  [key: string]: any;
}

interface StockComparisonChartProps {
  stocks: Stock[];
  timeRange: string;
}

export function StockComparisonChart({
  stocks,
  timeRange,
}: StockComparisonChartProps) {
  // Generate mock historical data for each stock
  const generateHistoricalData = () => {
    const now = new Date();
    let startDate: Date;
    let dataPoints: number;

    switch (timeRange) {
      case "1M":
        startDate = subMonths(now, 1);
        dataPoints = 30;
        break;
      case "3M":
        startDate = subMonths(now, 3);
        dataPoints = 90;
        break;
      case "6M":
        startDate = subMonths(now, 6);
        dataPoints = 180;
        break;
      case "1Y":
        startDate = subYears(now, 1);
        dataPoints = 52; // Weekly data points
        break;
      case "ALL":
      default:
        startDate = subYears(now, 3);
        dataPoints = 36; // Monthly data points
        break;
    }

    // Generate data points for each stock
    const data = [];
    const interval = (now.getTime() - startDate.getTime()) / dataPoints;

    for (let i = 0; i <= dataPoints; i++) {
      const date = new Date(startDate.getTime() + i * interval);
      const dataPoint: any = { date };

      stocks.forEach((stock) => {
        // Create realistic price movements based on the stock's current performance
        const volatility = Math.abs(stock.profitLossPercent) / 100 + 0.05;
        const trend = stock.profitLossPercent / 100 / dataPoints;

        // Start with current price and work backwards with some randomness
        const priceMultiplier =
          1 - trend * (dataPoints - i) + (Math.random() - 0.5) * volatility;
        dataPoint[stock.symbol] = stock.currentPrice * priceMultiplier;
      });

      data.push(dataPoint);
    }

    return data;
  };

  const historicalData = generateHistoricalData();

  // Generate a unique color for each stock
  const getStockColor = (index: number) => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(142, 71%, 45%)", // emerald-500
      "hsl(38, 92%, 50%)", // amber-500
      "hsl(356, 100%, 66%)", // rose-500
      "hsl(198, 93%, 60%)", // sky-500
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={historicalData}>
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
              if (active && payload && payload.length && payload[0]?.payload) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          {format(new Date(data.date), "MMMM d, yyyy")}
                        </span>
                        {stocks.map((stock, index) => (
                          <div
                            key={stock.symbol}
                            className="flex items-center gap-2"
                          >
                            <div className="flex items-center gap-1">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: getStockColor(index),
                                }}
                              />
                              <span className="text-xs font-bold text-muted-foreground">
                                {stock.symbol}:
                              </span>
                            </div>
                            <span className="text-xs font-bold">
                              ${data[stock.symbol]?.toFixed(2) || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          {stocks.map((stock, index) => (
            <Line
              key={stock.symbol}
              type="monotone"
              dataKey={stock.symbol}
              stroke={getStockColor(index)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, style: { fill: getStockColor(index) } }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
