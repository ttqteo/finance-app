import { CalendarClock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Mock upcoming payments data
const upcomingPayments = [
  {
    id: 1,
    name: "Rent",
    amount: 1500,
    dueDate: "May 1, 2025",
    daysLeft: 2,
    isPriority: true,
    category: "Housing",
    status: "pending",
  },
  {
    id: 2,
    name: "Car Insurance",
    amount: 180,
    dueDate: "May 5, 2025",
    daysLeft: 6,
    isPriority: false,
    category: "Insurance",
    status: "pending",
  },
  {
    id: 3,
    name: "Electric Bill",
    amount: 120,
    dueDate: "May 10, 2025",
    daysLeft: 11,
    isPriority: false,
    category: "Utilities",
    status: "pending",
  },
  {
    id: 4,
    name: "Credit Card Payment",
    amount: 350,
    dueDate: "May 15, 2025",
    daysLeft: 16,
    isPriority: true,
    category: "Debt",
    status: "pending",
  },
  {
    id: 5,
    name: "Internet Bill",
    amount: 85,
    dueDate: "May 18, 2025",
    daysLeft: 19,
    isPriority: false,
    category: "Utilities",
    status: "pending",
  },
];

export function UpcomingPayments() {
  // Calculate total upcoming payments
  const totalUpcoming = upcomingPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  // Sort by days left (closest due date first)
  const sortedPayments = [...upcomingPayments].sort(
    (a, b) => a.daysLeft - b.daysLeft
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Total Upcoming</span>
        <span className="text-sm font-bold">${totalUpcoming.toFixed(2)}</span>
      </div>

      <div className="space-y-4">
        {sortedPayments.map((payment) => (
          <div key={payment.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{payment.name}</span>
                {payment.isPriority && (
                  <Badge variant="destructive" className="h-5">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Priority
                  </Badge>
                )}
              </div>
              <span className="text-sm font-medium">
                ${payment.amount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{payment.dueDate}</span>
              <span
                className={`${
                  payment.daysLeft <= 3
                    ? "text-red-500 font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {payment.daysLeft} {payment.daysLeft === 1 ? "day" : "days"}{" "}
                left
              </span>
            </div>

            <Progress
              value={100 - (payment.daysLeft / 30) * 100}
              className={cn(
                "h-1",
                payment.daysLeft <= 3
                  ? "bg-red-500"
                  : payment.daysLeft <= 7
                  ? "bg-orange-500"
                  : "bg-green-500"
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
