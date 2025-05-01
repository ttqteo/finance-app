import { ArrowDown, ArrowUp } from "lucide-react";

export function RecentTransactions() {
  const transactions = [
    {
      id: "1",
      date: "2023-11-15",
      symbol: "AAPL",
      type: "Buy",
      quantity: 5,
      price: 175.5,
      total: 877.5,
    },
    {
      id: "2",
      date: "2023-11-10",
      symbol: "MSFT",
      type: "Buy",
      quantity: 3,
      price: 290.35,
      total: 871.05,
    },
    {
      id: "3",
      date: "2023-11-05",
      symbol: "TSLA",
      type: "Sell",
      quantity: 2,
      price: 650.25,
      total: 1300.5,
    },
    {
      id: "4",
      date: "2023-10-28",
      symbol: "AMZN",
      type: "Buy",
      quantity: 1,
      price: 3200.75,
      total: 3200.75,
    },
  ];

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <div
            className={`mr-2 flex h-8 w-8 items-center justify-center rounded-full ${
              transaction.type === "Buy" ? "bg-emerald-100" : "bg-rose-100"
            }`}
          >
            {transaction.type === "Buy" ? (
              <ArrowDown className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowUp className="h-4 w-4 text-rose-500" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.type} {transaction.quantity} {transaction.symbol}
            </p>
            <p className="text-xs text-muted-foreground">{transaction.date}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              ${transaction.total.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              ${transaction.price.toFixed(2)} per share
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
