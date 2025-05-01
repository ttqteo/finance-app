"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  LineChart,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockDetailChart } from "@/components/dashboard/investing/stock-detail-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "next/navigation";

// Mock data for the stock
const stockData = {
  symbol: "AAPL",
  name: "Apple Inc.",
  quantity: 10,
  avgPrice: 150.25,
  currentPrice: 175.5,
  value: 1755.0,
  profitLoss: 252.5,
  profitLossPercent: 16.8,
  dayChange: 1.25,
  dayChangePercent: 0.72,
  sector: "Technology",
  industry: "Consumer Electronics",
  marketCap: "2.85T",
  peRatio: 28.5,
  dividendYield: 0.58,
  beta: 1.2,
  yearHigh: 182.94,
  yearLow: 124.17,
  avgVolume: "85.5M",
};

// Mock transaction data
const transactions = [
  {
    id: "1",
    date: "2023-01-15",
    type: "Buy",
    quantity: 5,
    price: 145.75,
    total: 728.75,
    fees: 4.99,
  },
  {
    id: "2",
    date: "2023-03-22",
    type: "Buy",
    quantity: 3,
    price: 152.5,
    total: 457.5,
    fees: 4.99,
  },
  {
    id: "3",
    date: "2023-06-10",
    type: "Buy",
    quantity: 2,
    price: 155.25,
    total: 310.5,
    fees: 4.99,
  },
];

export default function StockDetailPage() {
  const params = useParams<{ symbol: string }>();

  const [timeRange, setTimeRange] = useState("1M");

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center space-x-2">
            <Link href="/stocks">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-3xl font-bold tracking-tight">
              {stockData.symbol}
            </h2>
            <span className="text-xl text-muted-foreground">
              {stockData.name}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/transactions/add?symbol=${params.symbol}`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Price
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stockData.currentPrice.toFixed(2)}
              </div>
              <div className="flex items-center">
                <Badge
                  className={
                    stockData.dayChangePercent >= 0
                      ? "bg-emerald-500 hover:bg-emerald-600 mr-2"
                      : "bg-rose-500 hover:bg-rose-600 mr-2"
                  }
                >
                  {stockData.dayChangePercent >= 0 ? "+" : ""}
                  {stockData.dayChangePercent.toFixed(2)}%
                </Badge>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Your Position
              </CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stockData.quantity} shares
              </div>
              <p className="text-xs text-muted-foreground">
                Avg. price: ${stockData.avgPrice.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stockData.value.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stockData.quantity} × ${stockData.currentPrice.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
              {stockData.profitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stockData.profitLoss >= 0
                    ? "text-emerald-500"
                    : "text-rose-500"
                }`}
              >
                {stockData.profitLoss >= 0 ? "+" : ""}$
                {stockData.profitLoss.toFixed(2)}
              </div>
              <div className="flex items-center">
                <Badge
                  className={
                    stockData.profitLossPercent >= 0
                      ? "bg-emerald-500 hover:bg-emerald-600 mr-2"
                      : "bg-rose-500 hover:bg-rose-600 mr-2"
                  }
                >
                  {stockData.profitLossPercent >= 0 ? "+" : ""}
                  {stockData.profitLossPercent.toFixed(2)}%
                </Badge>
                <p className="text-xs text-muted-foreground">Overall return</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Price History</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1D">1 Day</SelectItem>
                      <SelectItem value="1W">1 Week</SelectItem>
                      <SelectItem value="1M">1 Month</SelectItem>
                      <SelectItem value="3M">3 Months</SelectItem>
                      <SelectItem value="6M">6 Months</SelectItem>
                      <SelectItem value="1Y">1 Year</SelectItem>
                      <SelectItem value="5Y">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <StockDetailChart timeRange={timeRange} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Your buy and sell transactions for {stockData.symbol}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Fees</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.date}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                transaction.type === "Buy"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {transaction.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            ${transaction.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${transaction.total.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${transaction.fees.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Details</CardTitle>
                <CardDescription>
                  Fundamental data for {stockData.name} ({stockData.symbol})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sector</span>
                      <span className="font-medium">{stockData.sector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry</span>
                      <span className="font-medium">{stockData.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Cap</span>
                      <span className="font-medium">
                        ${stockData.marketCap}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">P/E Ratio</span>
                      <span className="font-medium">{stockData.peRatio}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Dividend Yield
                      </span>
                      <span className="font-medium">
                        {stockData.dividendYield}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Beta</span>
                      <span className="font-medium">{stockData.beta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        52-Week High
                      </span>
                      <span className="font-medium">${stockData.yearHigh}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">52-Week Low</span>
                      <span className="font-medium">${stockData.yearLow}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
