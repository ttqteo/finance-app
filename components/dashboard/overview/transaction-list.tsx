import {
  ArrowUpRight,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Home,
  Utensils,
  Car,
  Zap,
  Wifi,
} from "lucide-react";

// Mock transaction data
const transactions = [
  {
    id: 1,
    type: "income",
    icon: <ArrowUpRight className="h-5 w-5" />,
    iconBg: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
    title: "Salary Deposit",
    account: "Chase Bank",
    date: "Apr 28, 2025",
    amount: 3250.0,
    category: "Income",
  },
  {
    id: 2,
    type: "expense",
    icon: <ShoppingBag className="h-5 w-5" />,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    title: "Whole Foods Market",
    account: "Debit Card",
    date: "Apr 27, 2025",
    amount: 89.42,
    category: "Groceries",
  },
  {
    id: 3,
    type: "expense",
    icon: <ShoppingBag className="h-5 w-5" />,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    title: "Amazon.com",
    account: "Credit Card",
    date: "Apr 26, 2025",
    amount: 156.88,
    category: "Shopping",
  },
  {
    id: 4,
    type: "expense",
    icon: <CreditCard className="h-5 w-5" />,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    title: "Netflix Subscription",
    account: "Credit Card",
    date: "Apr 24, 2025",
    amount: 19.99,
    category: "Entertainment",
  },
  {
    id: 5,
    type: "income",
    icon: <DollarSign className="h-5 w-5" />,
    iconBg: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
    title: "Stock Dividend",
    account: "Brokerage",
    date: "Apr 22, 2025",
    amount: 42.5,
    category: "Investment",
  },
  {
    id: 6,
    type: "expense",
    icon: <Home className="h-5 w-5" />,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    title: "Rent Payment",
    account: "Checking Account",
    date: "Apr 15, 2025",
    amount: 1500.0,
    category: "Housing",
  },
  {
    id: 7,
    type: "expense",
    icon: <Utensils className="h-5 w-5" />,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    title: "Cheesecake Factory",
    account: "Credit Card",
    date: "Apr 14, 2025",
    amount: 78.45,
    category: "Dining Out",
  },
  {
    id: 8,
    type: "expense",
    icon: <Car className="h-5 w-5" />,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    title: "Shell Gas Station",
    account: "Credit Card",
    date: "Apr 12, 2025",
    amount: 45.67,
    category: "Transportation",
  },
  {
    id: 9,
    type: "expense",
    icon: <Zap className="h-5 w-5" />,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    title: "Electric Company",
    account: "Checking Account",
    date: "Apr 10, 2025",
    amount: 120.34,
    category: "Utilities",
  },
  {
    id: 10,
    type: "expense",
    icon: <Wifi className="h-5 w-5" />,
    iconBg: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    title: "Internet Provider",
    account: "Credit Card",
    date: "Apr 8, 2025",
    amount: 85.0,
    category: "Utilities",
  },
];

interface TransactionListProps {
  extended?: boolean;
  limit?: number;
}

export function TransactionList({
  extended = false,
  limit = 5,
}: TransactionListProps) {
  // Limit the number of transactions shown unless extended view
  const displayTransactions = extended
    ? transactions
    : transactions.slice(0, limit);

  return (
    <div className="space-y-4">
      {displayTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center gap-4">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${transaction.iconBg}`}
          >
            {transaction.icon}
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {transaction.account} • {transaction.date}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-sm font-medium leading-none ${
                transaction.type === "income"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}$
              {transaction.amount.toFixed(2)}
            </p>
            {extended && (
              <p className="text-sm text-muted-foreground">
                {transaction.category}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
