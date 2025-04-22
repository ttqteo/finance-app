"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

export default function AddTransactionPage() {
  const searchParams = useSearchParams();
  const [date, setDate] = useState<Date>();
  const [transactionType, setTransactionType] = useState("buy");
  const [symbol, setSymbol] = useState(searchParams.get("symbol") || "");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [fees, setFees] = useState("4.99");

  const calculateTotal = () => {
    const quantityNum = Number.parseFloat(quantity) || 0;
    const priceNum = Number.parseFloat(price) || 0;
    const feesNum = Number.parseFloat(fees) || 0;

    return (quantityNum * priceNum + feesNum).toFixed(2);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Link href="/stocks">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Add Transaction</h2>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Record Stock Transaction</CardTitle>
            <CardDescription>
              Add a buy or sell transaction to your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <RadioGroup
                id="transaction-type"
                defaultValue="buy"
                className="flex space-x-4"
                value={transactionType}
                onValueChange={setTransactionType}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buy" id="buy" />
                  <Label htmlFor="buy">Buy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sell" id="sell" />
                  <Label htmlFor="sell">Sell</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., AAPL"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Number of shares"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price per Share</Label>
              <Input
                id="price"
                type="number"
                placeholder="Price per share"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fees">Fees/Commission</Label>
              <Input
                id="fees"
                type="number"
                placeholder="Transaction fees"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <Label>Total</Label>
                <div className="text-xl font-bold">${calculateTotal()}</div>
              </div>
              <p className="text-xs text-muted-foreground">
                {transactionType === "buy" ? "Total cost" : "Total proceeds"}{" "}
                including fees
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Save Transaction</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
