import { ArrowDown, ArrowUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stocks = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 15,
    price: 178.72,
    change: 1.25,
    value: 2680.8,
    costBasis: 145.32,
    gain: 33.4,
    gainPercent: 22.98,
    sector: "Technology",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    shares: 10,
    price: 402.65,
    change: -0.78,
    value: 4026.5,
    costBasis: 320.45,
    gain: 82.2,
    gainPercent: 25.65,
    sector: "Technology",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 5,
    price: 165.84,
    change: 2.34,
    value: 829.2,
    costBasis: 135.67,
    gain: 30.17,
    gainPercent: 22.24,
    sector: "Technology",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    shares: 8,
    price: 178.75,
    change: 0.92,
    value: 1430.0,
    costBasis: 145.3,
    gain: 33.45,
    gainPercent: 23.02,
    sector: "Consumer Cyclical",
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    shares: 12,
    price: 215.98,
    change: -1.45,
    value: 2591.76,
    costBasis: 240.5,
    gain: -24.52,
    gainPercent: -10.19,
    sector: "Consumer Cyclical",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    shares: 20,
    price: 182.56,
    change: 0.65,
    value: 3651.2,
    costBasis: 150.25,
    gain: 32.31,
    gainPercent: 21.5,
    sector: "Financial Services",
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    shares: 15,
    price: 147.89,
    change: -0.32,
    value: 2218.35,
    costBasis: 160.45,
    gain: -12.56,
    gainPercent: -7.83,
    sector: "Healthcare",
  },
  {
    symbol: "PG",
    name: "Procter & Gamble Co.",
    shares: 18,
    price: 162.34,
    change: 0.87,
    value: 2922.12,
    costBasis: 145.78,
    gain: 16.56,
    gainPercent: 11.36,
    sector: "Consumer Defensive",
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    shares: 10,
    price: 275.45,
    change: 1.23,
    value: 2754.5,
    costBasis: 230.67,
    gain: 44.78,
    gainPercent: 19.41,
    sector: "Financial Services",
  },
  {
    symbol: "DIS",
    name: "Walt Disney Co.",
    shares: 25,
    price: 112.34,
    change: -0.56,
    value: 2808.5,
    costBasis: 135.2,
    gain: -22.86,
    gainPercent: -16.91,
    sector: "Communication Services",
  },
];

export function StockTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Shares</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stocks.map((stock) => (
          <TableRow key={stock.symbol}>
            <TableCell className="font-medium">{stock.symbol}</TableCell>
            <TableCell>{stock.name}</TableCell>
            <TableCell className="text-right">{stock.shares}</TableCell>
            <TableCell className="text-right">
              ${stock.price.toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end">
                {stock.change > 0 ? (
                  <>
                    <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                    <span className="text-green-500">
                      {stock.change.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                    <span className="text-red-500">
                      {Math.abs(stock.change).toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              ${stock.value.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
