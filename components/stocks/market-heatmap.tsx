"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Mock data for sector performance
const sectorPerformance = [
  { name: "Technology", change: 2.34 },
  { name: "Finance", change: 1.56 },
  { name: "Healthcare", change: 0.89 },
  { name: "Consumer", change: -0.45 },
  { name: "Energy", change: -1.23 },
  { name: "Materials", change: 0.67 },
  { name: "Utilities", change: -0.34 },
  { name: "Real Estate", change: -1.78 },
  { name: "Telecom", change: 1.12 },
  { name: "Industrials", change: 0.56 },
];

// Mock data for market liquidity
const marketLiquidity = {
  totalVolume: 756.4, // million shares
  totalValue: 12345.67, // billion VND
  previousDayVolume: 723.8, // million shares
  previousDayValue: 11987.45, // billion VND
  volumeChange: 4.5, // percentage
  valueChange: 3.0, // percentage
  topGainers: [
    { symbol: "VIC", price: 75.6, change: 3.45 },
    { symbol: "VHM", price: 56.7, change: 2.89 },
    { symbol: "VNM", price: 89.3, change: 2.56 },
  ],
  topLosers: [
    { symbol: "HPG", price: 23.4, change: -2.34 },
    { symbol: "MSN", price: 67.8, change: -1.89 },
    { symbol: "VRE", price: 34.5, change: -1.67 },
  ],
  topVolume: [
    { symbol: "STB", volume: 12.5, value: 345.6 },
    { symbol: "MBB", volume: 10.8, value: 298.4 },
    { symbol: "TCB", volume: 9.7, value: 267.3 },
  ],
};

// Generate heatmap data
const generateHeatmapData = () => {
  const sectors = [
    "Technology",
    "Finance",
    "Healthcare",
    "Consumer",
    "Energy",
    "Materials",
    "Utilities",
    "Real Estate",
    "Telecom",
    "Industrials",
  ];

  const stocks: {
    symbol: string;
    sector: string;
    change: number;
    marketCap: number;
  }[] = [];

  sectors.forEach((sector) => {
    // Generate 5-10 stocks per sector
    const stockCount = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < stockCount; i++) {
      // Generate a random 3-letter symbol
      const symbol = `${sector.substring(0, 1)}${String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

      // Generate a random change between -5% and +5%
      const change = (Math.random() * 10 - 5).toFixed(2);

      // Generate a random market cap between 1B and 100B
      const marketCap = Math.floor(Math.random() * 99) + 1;

      stocks.push({
        symbol,
        sector,
        change: Number.parseFloat(change),
        marketCap,
      });
    }
  });

  return stocks;
};

const heatmapData = generateHeatmapData();

export function MarketHeatmap() {
  const [timeframe, setTimeframe] = useState("daily");

  // Get color based on percentage change
  const getColor = (change: number) => {
    if (change > 3) return "bg-emerald-600";
    if (change > 2) return "bg-emerald-500";
    if (change > 1) return "bg-emerald-400";
    if (change > 0) return "bg-emerald-300";
    if (change === 0) return "bg-gray-300";
    if (change > -1) return "bg-rose-300";
    if (change > -2) return "bg-rose-400";
    if (change > -3) return "bg-rose-500";
    return "bg-rose-600";
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Sector Heatmap</TabsTrigger>
          <TabsTrigger value="liquidity">Market Liquidity</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Market Heatmap</h3>
            <div className="flex space-x-2">
              <TabsList className="h-8">
                <TabsTrigger
                  value="daily"
                  className="h-8 px-3 text-xs"
                  onClick={() => setTimeframe("daily")}
                >
                  Daily
                </TabsTrigger>
                <TabsTrigger
                  value="weekly"
                  className="h-8 px-3 text-xs"
                  onClick={() => setTimeframe("weekly")}
                >
                  Weekly
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="h-8 px-3 text-xs"
                  onClick={() => setTimeframe("monthly")}
                >
                  Monthly
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">
                Sector Performance ({timeframe})
              </h4>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sectorPerformance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Change"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                    <Bar dataKey="change" radius={[0, 4, 4, 0]} barSize={20}>
                      {sectorPerformance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.change >= 0
                              ? "hsl(142, 71%, 45%)"
                              : "hsl(356, 100%, 66%)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Stock Heatmap</h4>
              <div className="border rounded-md p-4 h-[300px] overflow-auto">
                <div className="grid grid-cols-6 gap-1">
                  {heatmapData.map((stock, index) => (
                    <div
                      key={index}
                      className={`${getColor(
                        stock.change
                      )} rounded p-1 text-white text-xs flex flex-col items-center justify-center`}
                      style={{
                        height: `${Math.max(
                          40,
                          Math.min(80, stock.marketCap)
                        )}px`,
                        width: "100%",
                      }}
                    >
                      <div className="font-bold">{stock.symbol}</div>
                      <div>{stock.change}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="liquidity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">
                  Today's Trading Volume
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Total Volume
                    </div>
                    <div className="text-2xl font-bold">
                      {marketLiquidity.totalVolume.toFixed(1)}M
                    </div>
                    <div
                      className={`text-sm ${
                        marketLiquidity.volumeChange >= 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {marketLiquidity.volumeChange >= 0 ? "+" : ""}
                      {marketLiquidity.volumeChange.toFixed(1)}% vs yesterday
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Total Value
                    </div>
                    <div className="text-2xl font-bold">
                      {(marketLiquidity.totalValue / 1000).toFixed(2)}T
                    </div>
                    <div
                      className={`text-sm ${
                        marketLiquidity.valueChange >= 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {marketLiquidity.valueChange >= 0 ? "+" : ""}
                      {marketLiquidity.valueChange.toFixed(1)}% vs yesterday
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Top Volume</h4>
                  <div className="space-y-2">
                    {marketLiquidity.topVolume.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div className="font-medium">{item.symbol}</div>
                        <div className="text-sm">
                          {item.volume.toFixed(1)}M shares
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.value.toFixed(1)}B
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Top Movers</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Gainers</h4>
                    <div className="space-y-2">
                      {marketLiquidity.topGainers.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <div className="font-medium">{item.symbol}</div>
                          <div className="text-sm">{item.price.toFixed(1)}</div>
                          <div className="text-sm text-emerald-500">
                            +{item.change.toFixed(2)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Losers</h4>
                    <div className="space-y-2">
                      {marketLiquidity.topLosers.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <div className="font-medium">{item.symbol}</div>
                          <div className="text-sm">{item.price.toFixed(1)}</div>
                          <div className="text-sm text-rose-500">
                            {item.change.toFixed(2)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-xs text-muted-foreground text-center">
                  Last updated: {format(new Date(), "MMM dd, yyyy HH:mm:ss")}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground">
        <p>
          Note: All data shown is for demonstration purposes only. Market data
          is delayed by at least 15 minutes.
        </p>
      </div>
    </div>
  );
}
