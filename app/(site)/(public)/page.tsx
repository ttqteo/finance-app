import { FinancialNews } from "@/components/homepage/financial-news";
import { GoldPriceDataTable } from "@/components/homepage/gold-price-table";
import { MarketHeatmap } from "@/components/homepage/market-heatmap";
import { MarketIndexes } from "@/components/homepage/market-indexes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllBlogs } from "@/lib/markdown";
import { stringToDate } from "@/lib/utils";
import { commodity } from "@/lib/vnstock";
import {
  BarChart3,
  CircleDollarSignIcon,
  LineChart,
  Newspaper,
} from "lucide-react";
import { IGoldPriceV2 } from "vnstock-js";

const WORLD_TYPE = ["XAUUSD", "USDX"];

export default async function MarketDashboardPage() {
  const blogs = (await getAllBlogs()).sort(
    (a, b) => stringToDate(b.date).getTime() - stringToDate(a.date).getTime()
  );
  const goldPrice = (await commodity.goldPriceV2()) as IGoldPriceV2[];
  const VietNamGold = goldPrice.filter(
    (_) => !WORLD_TYPE.includes(_.type_code)
  );
  const WorldGold = goldPrice.filter((_) => WORLD_TYPE.includes(_.type_code));

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">
                Giá Vàng Trong Nước
              </CardTitle>
              <CardDescription>Nguồn giavang.net</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <GoldPriceDataTable goldPrice={VietNamGold} />
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
    </>
  );
}
