"use client";

import { useState } from "react";
import { Download, LineChart, PieChart, TrendingUp, Zap } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PortfolioPerformanceChart } from "@/components/stocks/portfolio-performance-chart";
import { SectorAllocationChart } from "@/components/stocks/sector-allocation-chart";
import { StockComparisonChart } from "@/components/stocks/stock-comparison-chart";
import { AIInsights } from "@/components/stocks/ai-insights";

// Mock portfolio data
const portfolioData = [
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

// Mock sector allocation data
const sectorData = [
  { name: "Technology", value: 45 },
  { name: "Healthcare", value: 25 },
  { name: "Finance", value: 15 },
  { name: "Consumer Goods", value: 10 },
  { name: "Energy", value: 5 },
];

// Mock stock data for comparison
const stocksData = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 10,
    avgPrice: 150.25,
    currentPrice: 175.5,
    value: 1755.0,
    profitLoss: 252.5,
    profitLossPercent: 16.8,
    sector: "Technology",
  },
  {
    id: "2",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    quantity: 5,
    avgPrice: 240.1,
    currentPrice: 290.35,
    value: 1451.75,
    profitLoss: 251.25,
    profitLossPercent: 20.9,
    sector: "Technology",
  },
  {
    id: "3",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    quantity: 3,
    avgPrice: 3100.5,
    currentPrice: 3200.75,
    value: 9602.25,
    profitLoss: 300.75,
    profitLossPercent: 3.2,
    sector: "Consumer Cyclical",
  },
  {
    id: "4",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    quantity: 2,
    avgPrice: 2500.0,
    currentPrice: 2750.25,
    value: 5500.5,
    profitLoss: 500.5,
    profitLossPercent: 10.0,
    sector: "Communication Services",
  },
  {
    id: "5",
    symbol: "TSLA",
    name: "Tesla, Inc.",
    quantity: 8,
    avgPrice: 700.5,
    currentPrice: 650.25,
    value: 5202.0,
    profitLoss: -402.0,
    profitLossPercent: -7.2,
    sector: "Consumer Cyclical",
  },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("1Y");
  const [selectedStocks, setSelectedStocks] = useState<string[]>([
    "AAPL",
    "MSFT",
    "GOOGL",
  ]);

  // Function to export portfolio data to CSV
  const exportPortfolioCSV = () => {
    // Create CSV header
    let csvContent = "Date,Portfolio Value\n";

    // Add data rows
    portfolioData.forEach((item) => {
      const formattedDate = format(item.date, "yyyy-MM-dd");
      csvContent += `${formattedDate},${item.value.toFixed(2)}\n`;
    });

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `portfolio-performance-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export stocks data to CSV
  const exportStocksCSV = () => {
    // Create CSV header
    let csvContent =
      "Symbol,Name,Quantity,Average Price,Current Price,Value,Profit/Loss,P/L %,Sector\n";

    // Add data rows
    stocksData.forEach((stock) => {
      csvContent += `${stock.symbol},${stock.name},${
        stock.quantity
      },${stock.avgPrice.toFixed(2)},${stock.currentPrice.toFixed(
        2
      )},${stock.value.toFixed(2)},${stock.profitLoss.toFixed(
        2
      )},${stock.profitLossPercent.toFixed(2)}%,${stock.sector}\n`;
    });

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `stocks-data-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to export sector allocation to CSV
  const exportSectorCSV = () => {
    // Create CSV header
    let csvContent = "Sector,Allocation Percentage\n";

    // Add data rows
    sectorData.forEach((sector) => {
      csvContent += `${sector.name},${sector.value}%\n`;
    });

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sector-allocation-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle stock selection for comparison
  const toggleStockSelection = (symbol: string) => {
    if (selectedStocks.includes(symbol)) {
      setSelectedStocks(selectedStocks.filter((s) => s !== symbol));
    } else {
      setSelectedStocks([...selectedStocks, symbol]);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">Last Month</SelectItem>
                <SelectItem value="3M">Last 3 Months</SelectItem>
                <SelectItem value="6M">Last 6 Months</SelectItem>
                <SelectItem value="1Y">Last Year</SelectItem>
                <SelectItem value="ALL">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="comparison">Stock Comparison</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Return
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-500">
                    +29.2%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +$10,231.89 since inception
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Annualized Return
                  </CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18.5%</div>
                  <p className="text-xs text-muted-foreground">
                    vs. S&P 500: 12.3%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Volatility
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Medium</div>
                  <p className="text-xs text-muted-foreground">Beta: 1.2</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sharpe Ratio
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.8</div>
                  <p className="text-xs text-muted-foreground">
                    Good risk-adjusted return
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>
                    Historical performance of your portfolio over time
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPortfolioCSV}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <PortfolioPerformanceChart
                  data={portfolioData}
                  timeRange={timeRange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sector Allocation</CardTitle>
                  <CardDescription>
                    Distribution of your investments across different sectors
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportSectorCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center justify-center">
                    <SectorAllocationChart data={sectorData} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Allocation Breakdown
                    </h3>
                    <div className="space-y-4">
                      {sectorData.map((sector) => (
                        <div key={sector.name} className="flex items-center">
                          <div
                            className={`w-[12px] h-[12px] rounded-full mr-2 ${
                              sector.name === "Technology"
                                ? "bg-primary"
                                : sector.name === "Healthcare"
                                ? "bg-emerald-500"
                                : sector.name === "Finance"
                                ? "bg-amber-500"
                                : sector.name === "Consumer Goods"
                                ? "bg-rose-500"
                                : "bg-sky-500"
                            }`}
                          />
                          <div className="flex-1">{sector.name}</div>
                          <div className="text-right font-medium">
                            {sector.value}%
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-2">
                        Diversification Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your portfolio is heavily weighted towards Technology
                        (45%). Consider diversifying into other sectors to
                        reduce risk. The recommended allocation for Technology
                        is typically 20-30% for a balanced portfolio.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Stock Comparison</CardTitle>
                  <CardDescription>
                    Compare performance of your stocks
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportStocksCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">
                    Select stocks to compare:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stocksData.map((stock) => (
                      <Button
                        key={stock.symbol}
                        variant={
                          selectedStocks.includes(stock.symbol)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => toggleStockSelection(stock.symbol)}
                      >
                        {stock.symbol}
                      </Button>
                    ))}
                  </div>
                </div>
                <StockComparisonChart
                  stocks={stocksData.filter((stock) =>
                    selectedStocks.includes(stock.symbol)
                  )}
                  timeRange={timeRange}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key metrics for selected stocks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="divide-x divide-border">
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">
                          Stock
                        </th>
                        <th className="px-4 py-3.5 text-right text-sm font-semibold">
                          Current Price
                        </th>
                        <th className="px-4 py-3.5 text-right text-sm font-semibold">
                          P/L %
                        </th>
                        <th className="px-4 py-3.5 text-right text-sm font-semibold">
                          Value
                        </th>
                        <th className="px-4 py-3.5 text-right text-sm font-semibold">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stocksData
                        .filter((stock) =>
                          selectedStocks.includes(stock.symbol)
                        )
                        .map((stock) => (
                          <tr key={stock.id} className="divide-x divide-border">
                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                              {stock.symbol}{" "}
                              <span className="text-muted-foreground">
                                ({stock.name})
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                              ${stock.currentPrice.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                              <span
                                className={
                                  stock.profitLossPercent >= 0
                                    ? "text-emerald-500"
                                    : "text-rose-500"
                                }
                              >
                                {stock.profitLossPercent >= 0 ? "+" : ""}
                                {stock.profitLossPercent.toFixed(2)}%
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                              ${stock.value.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                              {(
                                (stock.value /
                                  stocksData.reduce(
                                    (sum, s) => sum + s.value,
                                    0
                                  )) *
                                100
                              ).toFixed(1)}
                              %
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            <AIInsights
              stocks={stocksData}
              portfolioData={portfolioData}
              sectorData={sectorData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
