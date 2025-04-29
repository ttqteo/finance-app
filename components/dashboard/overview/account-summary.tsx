import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountSummaryProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export function AccountSummary({
  title,
  value,
  change,
  trend,
}: AccountSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center text-xs">
          {trend === "up" && (
            <>
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
              <span className="text-green-500">{change}</span>
            </>
          )}
          {trend === "down" && (
            <>
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
              <span className="text-red-500">{change}</span>
            </>
          )}
          <span className="ml-1 text-muted-foreground">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
