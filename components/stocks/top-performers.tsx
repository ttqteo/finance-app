import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TopPerformers() {
  const performers = [
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      profitLoss: 251.25,
      profitLossPercent: 20.9,
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      profitLoss: 252.5,
      profitLossPercent: 16.8,
    },
    {
      symbol: "NFLX",
      name: "Netflix, Inc.",
      profitLoss: 239.0,
      profitLossPercent: 11.5,
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      profitLoss: 500.5,
      profitLossPercent: 10.0,
    },
  ];

  return (
    <div className="space-y-4">
      {performers.map((stock) => (
        <div key={stock.symbol} className="flex items-center">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{stock.symbol}</p>
            <p className="text-xs text-muted-foreground">{stock.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              +${stock.profitLoss.toFixed(2)}
            </p>
            <Badge className="bg-emerald-500 hover:bg-emerald-600">
              +{stock.profitLossPercent.toFixed(2)}%
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
