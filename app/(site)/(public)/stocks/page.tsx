"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for stocks
const stocks = [
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
  {
    id: "6",
    symbol: "NFLX",
    name: "Netflix, Inc.",
    quantity: 4,
    avgPrice: 520.75,
    currentPrice: 580.5,
    value: 2322.0,
    profitLoss: 239.0,
    profitLossPercent: 11.5,
    sector: "Communication Services",
  },
  {
    id: "7",
    symbol: "FB",
    name: "Meta Platforms, Inc.",
    quantity: 6,
    avgPrice: 330.25,
    currentPrice: 310.75,
    value: 1864.5,
    profitLoss: -117.0,
    profitLossPercent: -5.9,
    sector: "Communication Services",
  },
];

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter stocks based on search query
  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort stocks based on column and direction
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    const aValue = a[sortColumn as keyof typeof a];
    const bValue = b[sortColumn as keyof typeof b];

    if (aValue === undefined || bValue === undefined) {
      return 0;
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      return sortDirection === "asc"
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    }
  });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Stocks</h2>
          <div className="flex items-center space-x-2">
            <Link href="/stocks/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Stock Portfolio</CardTitle>
            <CardDescription>
              Manage and track all your stock investments in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-4">
              <Input
                placeholder="Search stocks..."
                className="max-w-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Sector</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Technology
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    Consumer Cyclical
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    Communication Services
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Performance</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Profitable
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    Loss-making
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="w-[100px] cursor-pointer"
                      onClick={() => handleSort("symbol")}
                    >
                      <div className="flex items-center">
                        Symbol
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("quantity")}
                    >
                      <div className="flex items-center justify-end">
                        Quantity
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("avgPrice")}
                    >
                      <div className="flex items-center justify-end">
                        Avg. Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("currentPrice")}
                    >
                      <div className="flex items-center justify-end">
                        Current Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("value")}
                    >
                      <div className="flex items-center justify-end">
                        Value
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("profitLossPercent")}
                    >
                      <div className="flex items-center justify-end">
                        P/L %
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/stocks/${stock.symbol}`}
                          className="hover:underline"
                        >
                          {stock.symbol}
                        </Link>
                      </TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell className="text-right">
                        {stock.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        ${stock.avgPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${stock.currentPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${stock.value.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={
                            stock.profitLossPercent >= 0
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : "bg-rose-500 hover:bg-rose-600"
                          }
                        >
                          {stock.profitLossPercent >= 0 ? "+" : ""}
                          {stock.profitLossPercent.toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link
                                href={`/stocks/${stock.symbol}`}
                                className="flex w-full"
                              >
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href={`/transactions/add?symbol=${stock.symbol}`}
                                className="flex w-full"
                              >
                                Add Transaction
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-500">
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
