import { LineChart, BarChart3, Newspaper } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarketIndexes } from "@/components/homepage/market-indexes";
import { MarketHeatmap } from "@/components/homepage/market-heatmap";
import { FinancialNews } from "@/components/homepage/financial-news";
import { getAllBlogs } from "@/lib/markdown";
import { stringToDate } from "@/lib/utils";

export default async function MarketDashboardPage() {
  const blogs = (await getAllBlogs()).sort(
    (a, b) => stringToDate(b.date).getTime() - stringToDate(a.date).getTime()
  );

  return (
    <>
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
              <CardDescription>Latest market updates and news</CardDescription>
            </div>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <FinancialNews blogs={blogs} />
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
    </>
  );
}
