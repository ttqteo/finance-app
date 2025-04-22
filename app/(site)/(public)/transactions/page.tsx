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

// Mock data for transactions
const transactions = [
  {
    id: "1",
    date: "2023-11-15",
    symbol: "AAPL",
    name: "Apple Inc.",
    type: "Buy",
    quantity: 5,
    price: 175.5,
    total: 877.5,
    fees: 4.99,
  },
  {
    id: "2",
    date: "2023-11-10",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    type: "Buy",
    quantity: 3,
    price: 290.35,
    total: 871.05,
    fees: 4.99,
  },
  {
    id: "3",
    date: "2023-11-05",
    symbol: "TSLA",
    name: "Tesla, Inc.",
    type: "Sell",
    quantity: 2,
    price: 650.25,
    total: 1300.5,
    fees: 4.99,
  },
  {
    id: "4",
    date: "2023-10-28",
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    type: "Buy",
    quantity: 1,
    price: 3200.75,
    total: 3200.75,
    fees: 4.99,
  },
  {
    id: "5",
    date: "2023-10-20",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    type: "Buy",
    quantity: 2,
    price: 2750.25,
    total: 5500.5,
    fees: 4.99,
  },
  {
    id: "6",
    date: "2023-10-15",
    symbol: "NFLX",
    name: "Netflix, Inc.",
    type: "Buy",
    quantity: 4,
    price: 580.5,
    total: 2322.0,
    fees: 4.99,
  },
  {
    id: "7",
    date: "2023-10-10",
    symbol: "FB",
    name: "Meta Platforms, Inc.",
    type: "Sell",
    quantity: 3,
    price: 310.75,
    total: 932.25,
    fees: 4.99,
  },
];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort transactions based on column and direction
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
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
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <div className="flex items-center space-x-2">
            <Link href="/transactions/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View and manage all your stock transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-4">
              <Input
                placeholder="Search transactions..."
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
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Buy
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    Sell
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Last 30 days
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    Last 90 days
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    This year
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
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("symbol")}
                    >
                      <div className="flex items-center">
                        Symbol
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center">
                        Type
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
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center justify-end">
                        Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("total")}
                    >
                      <div className="flex items-center justify-end">
                        Total
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.date}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/stocks/${transaction.symbol}`}
                          className="hover:underline"
                        >
                          {transaction.symbol}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.type === "Buy" ? "default" : "secondary"
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-500">
                              Delete
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
