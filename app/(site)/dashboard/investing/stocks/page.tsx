"use client";

import { useState, useEffect } from "react";
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
import { AddStockDialog } from "@/components/stocks/add-stock-dialog";
import { getCurrentPrice } from "@/actions/stock-data";

interface StockHolding {
  id: string;
  symbol: string;
  name: string; // We might not get name from vnstock easily, so maybe use symbol or fetch it
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  profitLoss: number;
  profitLossPercent: number;
  sector: string;
}

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("symbol");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial seed data or empty
  useEffect(() => {
    // We can seed with some data if needed, or start empty.
    // For now, let's start empty or with one example if user wants.
    // User said "user only enters initial positions", so start empty.
  }, []);

  const handleAddStock = async (newStock: {
    symbol: string;
    quantity: number;
    avgPrice: number;
  }) => {
    const stock: StockHolding = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: newStock.symbol,
      name: newStock.symbol, // Placeholder
      quantity: newStock.quantity,
      avgPrice: newStock.avgPrice,
      currentPrice: 0, // Will fetch
      value: 0,
      profitLoss: 0,
      profitLossPercent: 0,
      sector: "Unknown",
    };

    setHoldings((prev) => [...prev, stock]);
    fetchPriceForStock(stock);
  };

  const fetchPriceForStock = async (stock: StockHolding) => {
    try {
      const data = await getCurrentPrice(stock.symbol);
      console.log(`Price data for ${stock.symbol}:`, data);

      if (data && typeof data.close === "number") {
        updateStockPrice(stock.id, data.close);
      }
    } catch (error) {
      console.error("Failed to fetch price", error);
    }
  };

  const updateStockPrice = (id: string, price: number) => {
    setHoldings((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const value = price * h.quantity;
        const profitLoss = value - h.avgPrice * h.quantity;
        const profitLossPercent =
          h.avgPrice > 0 ? (profitLoss / (h.avgPrice * h.quantity)) * 100 : 0;
        return {
          ...h,
          currentPrice: price,
          value,
          profitLoss,
          profitLossPercent,
        };
      })
    );
  };

  // Filter stocks based on search query
  const filteredStocks = holdings.filter(
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
            <AddStockDialog onAdd={handleAddStock} />
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
                  {sortedStocks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No stocks found. Add one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedStocks.map((stock) => (
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
                          ${stock.avgPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${stock.currentPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${stock.value.toLocaleString()}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
