"use client";

import { LineChart, BarChart3, Newspaper } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarketIndexes } from "@/components/stocks/market-indexes";
import { MarketHeatmap } from "@/components/stocks/market-heatmap";
import { FinancialNews } from "@/components/stocks/financial-news";

export default function MarketDashboardPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">
                  Market Indexes
                </CardTitle>
                <CardDescription>
                  Track local and international markets
                </CardDescription>
              </div>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <MarketIndexes />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base font-medium">
                  Financial News
                </CardTitle>
                <CardDescription>
                  Latest market updates and news
                </CardDescription>
              </div>
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <FinancialNews />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">
                Market Heatmap & Liquidity
              </CardTitle>
              <CardDescription>
                Sector performance and trading volume
              </CardDescription>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <MarketHeatmap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
