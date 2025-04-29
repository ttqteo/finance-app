import { Check, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock subscription data
const subscriptions = [
  {
    id: 1,
    name: "Netflix",
    price: 19.99,
    billingCycle: "Monthly",
    nextBilling: "May 24, 2025",
    category: "Entertainment",
    status: "active",
  },
  {
    id: 2,
    name: "Spotify Premium",
    price: 9.99,
    billingCycle: "Monthly",
    nextBilling: "May 15, 2025",
    category: "Entertainment",
    status: "active",
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    price: 52.99,
    billingCycle: "Monthly",
    nextBilling: "May 10, 2025",
    category: "Software",
    status: "active",
  },
  {
    id: 4,
    name: "Amazon Prime",
    price: 14.99,
    billingCycle: "Monthly",
    nextBilling: "May 7, 2025",
    category: "Shopping",
    status: "active",
  },
  {
    id: 5,
    name: "Gym Membership",
    price: 45.0,
    billingCycle: "Monthly",
    nextBilling: "May 2, 2025",
    category: "Health",
    status: "active",
  },
  {
    id: 6,
    name: "iCloud Storage",
    price: 2.99,
    billingCycle: "Monthly",
    nextBilling: "May 18, 2025",
    category: "Software",
    status: "active",
  },
];

export function SubscriptionList() {
  // Calculate total monthly subscription cost
  const totalMonthlyCost = subscriptions.reduce(
    (total, sub) => total + sub.price,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Total Monthly Cost</span>
        <span className="text-sm font-bold">
          ${totalMonthlyCost.toFixed(2)}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Next Billing</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {subscription.name}
                  {subscription.status === "active" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="h-5 border-green-500 text-green-500"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This subscription is currently active</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell>{subscription.category}</TableCell>
              <TableCell className="text-right">
                ${subscription.price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {subscription.nextBilling}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center text-xs text-muted-foreground">
                <Info className="mr-1 h-3 w-3" />
                Manage subscriptions
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to manage your subscriptions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
