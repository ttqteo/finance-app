"use client";

// `asset-allocation.tsx`, `stock-table.tsx` and `chat-assistant.tsx` are no
// longer rendered here: they are still hardcoded mock, and nothing in the
// schema (accounts, categories, transactions, subscriptions, user_settings)
// can back them. The files stay on disk for the investing work.
import { ExpenseChart } from "@/components/dashboard/overview/expense-chart";
import { MonthlyCalendar } from "@/components/dashboard/overview/monthly-calendar";
import { SpendingBreakdown } from "@/components/dashboard/overview/spending-breakdown";
import { SubscriptionList } from "@/components/dashboard/overview/subscription-list";
import { TransactionList } from "@/components/dashboard/overview/transaction-list";
import { UpcomingPayments } from "@/components/dashboard/overview/upcoming-payments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const NewOverview = () => {
  const t = useTranslations("OverviewPage");
  const tAccounts = useTranslations("AccountsPage");
  const tCategories = useTranslations("CategoriesPage");
  const tSettings = useTranslations("SettingsPage");

  return (
    <>
      <Tabs defaultValue="overview" className="space-y-4">
        {/* Only the two tabs backed by real queries are left. Accounts,
            Categories and Settings became links because each already has a
            real page — the tab panels were reimplementations of those pages
            with invented balances and category trees. Budget has no link
            because it has no page and no table: there is nothing to send
            anyone to. Same call as the Investments tab, for the same reason. */}
        <div className="flex flex-wrap items-center gap-2">
          <TabsList>
            <TabsTrigger value="overview">{t("Header")}</TabsTrigger>
            <TabsTrigger value="transactions">{t("Transactions")}</TabsTrigger>
          </TabsList>

          <nav className="flex flex-wrap items-center gap-1">
            <RealPageLink href="/dashboard/accounts" label={tAccounts("Header")} />
            <RealPageLink
              href="/dashboard/categories"
              label={tCategories("Header")}
            />
            <RealPageLink href="/dashboard/settings" label={tSettings("Header")} />
          </nav>
        </div>

        {/* Three rows of 4 + 3 columns. Removing the four cards that had no
            data source left holes in the old layout, so SpendingBreakdown
            moved up into the slot AssetAllocation used to hold. */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>{t("CashFlow")}</CardTitle>
                <CardDescription>{t("CashFlowDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t("SpendingBreakdown")}</CardTitle>
                <CardDescription>
                  {t("SpendingByCategoryDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpendingBreakdown />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("RecentTransactions")}</CardTitle>
                  <CardDescription>
                    {t("RecentTransactionsDesc")}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  {t("ViewAll")}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <TransactionList />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t("MonthlyCalendar")}</CardTitle>
                <CardDescription>{t("MonthlyCalendarDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyCalendar />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>{t("ActiveSubscriptions")}</CardTitle>
                <CardDescription>
                  {t("ActiveSubscriptionsDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionList />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t("ComingUp")}</CardTitle>
                <CardDescription>{t("ComingUpDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingPayments />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("AllTransactions")}</CardTitle>
              <CardDescription>{t("AllTransactionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList extended />
            </CardContent>
          </Card>
        </TabsContent>

        {/* The "investments" tab is gone with its three cards. "Portfolio
            Performance" rendered a second <ExpenseChart />, i.e. an
            income/expense chart under an investment heading — harmless while
            it was mock, actively false once it showed real transactions. The
            other two were AssetAllocation and StockTable, which have no table
            to read from. Nothing was left to put in the tab, so the trigger
            went too rather than leading to a blank panel. */}
      </Tabs>
    </>
  );
};

export default NewOverview;

/**
 * Styled to sit next to the tab triggers without pretending to be one: these
 * navigate away, so they read as links and carry an outbound arrow rather than
 * a selected state.
 */
function RealPageLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium",
        "text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
      )}
    >
      {label}
      <ArrowUpRight className="size-3.5" />
    </Link>
  );
}
