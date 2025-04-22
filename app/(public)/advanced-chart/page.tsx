"use client";

import { useState } from "react";
import { Search, Settings, Plus, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandlestickChart } from "@/components/stocks/candlestick-chart";
import { ChartIndicators } from "@/components/stocks/chart-indicators";
import { Watchlist } from "@/components/stocks/watchlist";

// Mock data for the current stock
const currentStock = {
  symbol: "AAPL",
  name: "Apple Inc.",
  price: 175.5,
  change: 2.34,
  changePercent: 1.35,
};

export default function AdvancedChartPage() {
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("candle");
  const [activeIndicators, setActiveIndicators] = useState<string[]>([
    "MA",
    "Volume",
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  // Function to handle adding an indicator
  const handleAddIndicator = (indicator: string) => {
    if (!activeIndicators.includes(indicator)) {
      setActiveIndicators([...activeIndicators, indicator]);
    }
  };

  // Function to handle removing an indicator
  const handleRemoveIndicator = (indicator: string) => {
    setActiveIndicators(activeIndicators.filter((i) => i !== indicator));
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Advanced Chart</h2>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for a symbol..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Chart
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    {currentStock.symbol}{" "}
                    <span className="text-muted-foreground text-base">
                      {currentStock.name}
                    </span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">
                      ${currentStock.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        currentStock.change >= 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {currentStock.change >= 0 ? "+" : ""}
                      {currentStock.change.toFixed(2)} (
                      {currentStock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candle">Candlestick</SelectItem>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1D">1D</SelectItem>
                      <SelectItem value="1W">1W</SelectItem>
                      <SelectItem value="1M">1M</SelectItem>
                      <SelectItem value="3M">3M</SelectItem>
                      <SelectItem value="6M">6M</SelectItem>
                      <SelectItem value="1Y">1Y</SelectItem>
                      <SelectItem value="5Y">5Y</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] w-full">
                  <CandlestickChart
                    timeframe={timeframe}
                    chartType={chartType}
                    activeIndicators={activeIndicators}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Technical Indicators</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Indicator
                </Button>
              </CardHeader>
              <CardContent>
                <ChartIndicators
                  activeIndicators={activeIndicators}
                  onAddIndicator={handleAddIndicator}
                  onRemoveIndicator={handleRemoveIndicator}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Tabs defaultValue="watchlist" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
                <TabsTrigger value="market">Market</TabsTrigger>
              </TabsList>
              <TabsContent value="watchlist" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>My Watchlist</CardTitle>
                      <CardDescription>
                        Track your favorite stocks
                      </CardDescription>
                    </div>
                    <Select defaultValue="default">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Select list" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="tech">Tech Stocks</SelectItem>
                        <SelectItem value="dividend">Dividend</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Watchlist />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="market" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Market Movers</CardTitle>
                      <CardDescription>Top gainers and losers</CardDescription>
                    </div>
                    <Select defaultValue="gainers">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gainers">Top Gainers</SelectItem>
                        <SelectItem value="losers">Top Losers</SelectItem>
                        <SelectItem value="volume">Most Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="rounded-md border">
                      <div className="p-4">
                        <div className="space-y-3">
                          {[
                            {
                              symbol: "NVDA",
                              name: "NVIDIA Corporation",
                              price: 487.21,
                              change: 3.45,
                            },
                            {
                              symbol: "AMD",
                              name: "Advanced Micro Devices",
                              price: 123.45,
                              change: 2.89,
                            },
                            {
                              symbol: "TSLA",
                              name: "Tesla, Inc.",
                              price: 245.67,
                              change: 2.56,
                            },
                            {
                              symbol: "AAPL",
                              name: "Apple Inc.",
                              price: 175.5,
                              change: 1.35,
                            },
                            {
                              symbol: "MSFT",
                              name: "Microsoft Corporation",
                              price: 378.92,
                              change: 1.23,
                            },
                          ].map((stock) => (
                            <div
                              key={stock.symbol}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <div className="font-medium">
                                  {stock.symbol}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {stock.name}
                                </div>
                              </div>
                              <div className="text-right">
                                <div>${stock.price.toFixed(2)}</div>
                                <div className="text-xs text-emerald-500">
                                  +{stock.change}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Stock Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Overview</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Open</span>
                        <span>$173.97</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">High</span>
                        <span>$176.82</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Low</span>
                        <span>$173.45</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Close</span>
                        <span>$175.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Volume</span>
                        <span>52.3M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Vol</span>
                        <span>58.7M</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Market Cap
                        </span>
                        <span>$2.75T</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">P/E Ratio</span>
                        <span>28.5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">EPS</span>
                        <span>$6.16</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dividend</span>
                        <span>$0.96 (0.55%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">52w High</span>
                        <span>$182.94</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">52w Low</span>
                        <span>$124.17</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
