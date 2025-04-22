"use client";

import { useState, useEffect } from "react";
import { Bot, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPortfolioInsights } from "@/actions/ai-actions";

interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  profitLossPercent: number;
  value: number;
  [key: string]: any;
}

interface AIInsightsProps {
  stocks: Stock[];
  portfolioData: { date: Date; value: number }[];
  sectorData: { name: string; value: number }[];
}

export function AIInsights({
  stocks,
  portfolioData,
  sectorData,
}: AIInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPortfolioInsights({
        stocks,
        portfolioPerformance: portfolioData,
        sectorAllocation: sectorData,
      });

      setInsights(result);
    } catch (err) {
      console.error("Error fetching AI insights:", err);
      setError("Failed to generate AI insights. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>AI Portfolio Insights</CardTitle>
          <CardDescription>Powered by Google Gemini AI</CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchInsights}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {insights && (
              <div
                dangerouslySetInnerHTML={{
                  __html: insights.replace(/\n/g, "<br />"),
                }}
              />
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        <div className="flex items-center">
          <Bot className="mr-2 h-4 w-4" />
          AI-generated insights are for informational purposes only and should
          not be considered financial advice.
        </div>
      </CardFooter>
    </Card>
  );
}
