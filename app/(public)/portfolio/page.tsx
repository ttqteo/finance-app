// import Footer from "@/components/landing/footer";
// import Hero from "@/components/landing/hero";

// const LandingPage = () => {
//   return (
//     <div className="max-w-screen-2xl mx-auto w-full">
//       <Hero />
//       <Footer />
//     </div>
//   );
// };

// export default LandingPage;

import Link from "next/link";
import { ArrowUp, DollarSign, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockChart } from "@/components/stocks/stock-chart";
import { RecentTransactions } from "@/components/stocks/recent-transactions";
import { TopPerformers } from "@/components/stocks/top-performers";

export default function Dashboard() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Link href="/stocks/add">
              <Button>Add Stock</Button>
            </Link>
            <Link href="/transactions/add">
              <Button variant="outline">Record Transaction</Button>
            </Link>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Portfolio Value
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Profit/Loss
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-500">
                    +$5,423.89
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12.5% overall return
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today Change
                  </CardTitle>
                  <ArrowUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-500">
                    +$849.65
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +1.9% from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Positions
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    2 added this month
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Portfolio Value Over Time</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <StockChart />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your latest stock purchases and sales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentTransactions />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Your best performing stocks</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopPerformers />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Portfolio Allocation</CardTitle>
                  <CardDescription>
                    Current distribution of your investments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-[12px] h-[12px] rounded-full bg-primary mr-2" />
                      <div className="flex-1">Technology</div>
                      <div className="text-right font-medium">45%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[12px] h-[12px] rounded-full bg-emerald-500 mr-2" />
                      <div className="flex-1">Healthcare</div>
                      <div className="text-right font-medium">25%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[12px] h-[12px] rounded-full bg-amber-500 mr-2" />
                      <div className="flex-1">Finance</div>
                      <div className="text-right font-medium">15%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[12px] h-[12px] rounded-full bg-rose-500 mr-2" />
                      <div className="flex-1">Consumer Goods</div>
                      <div className="text-right font-medium">10%</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-[12px] h-[12px] rounded-full bg-sky-500 mr-2" />
                      <div className="flex-1">Energy</div>
                      <div className="text-right font-medium">5%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                  <CardDescription>
                    Compare your portfolio against market indices
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <StockChart />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>
                    Portfolio volatility and risk metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>Beta</div>
                      <div className="font-medium">1.2</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Sharpe Ratio</div>
                      <div className="font-medium">1.8</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Volatility</div>
                      <div className="font-medium">Medium</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Diversification Score</div>
                      <div className="font-medium">7.5/10</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
