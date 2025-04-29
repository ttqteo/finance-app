"use client";
import { AccountSummary } from "@/components/dashboard/overview/account-summary";
import { AssetAllocation } from "@/components/dashboard/overview/asset-allocation";
import { ChatAssistant } from "@/components/dashboard/overview/chat-assistant";
import { ExpenseChart } from "@/components/dashboard/overview/expense-chart";
import { MonthlyCalendar } from "@/components/dashboard/overview/monthly-calendar";
import { SpendingBreakdown } from "@/components/dashboard/overview/spending-breakdown";
import { StockTable } from "@/components/dashboard/overview/stock-table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, ChevronDown, Plus } from "lucide-react";

const NewOverview = () => {
  return (
    <>
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold md:text-2xl">Overview</h1>
        <div className="ml-auto flex items-center gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 rounded-lg border px-3 py-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">Apr 2025</span>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AccountSummary
          title="Total Balance"
          value="$24,563.00"
          change="+2.5%"
          trend="up"
        />
        <AccountSummary
          title="Monthly Income"
          value="$8,350.00"
          change="+4.3%"
          trend="up"
        />
        <AccountSummary
          title="Monthly Expenses"
          value="$5,240.00"
          change="-1.2%"
          trend="down"
        />
        <AccountSummary
          title="Investments"
          value="$12,580.00"
          change="+8.7%"
          trend="up"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Cash Flow</CardTitle>
                <CardDescription>
                  Your income and expenses over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Spending Categories</CardTitle>
                <CardDescription>Where your money is going</CardDescription>
              </CardHeader>
              <CardContent>
                <AssetAllocation />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your latest financial activity
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <TransactionList />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Monthly Calendar</CardTitle>
                <CardDescription>Upcoming bills and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyCalendar />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Financial Assistant</CardTitle>
                <CardDescription>
                  Ask questions about your finances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatAssistant />
              </CardContent>
            </Card>
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Spending Breakdown</CardTitle>
                <CardDescription>
                  This month spending by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SpendingBreakdown />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>
                  Your recurring monthly payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionList />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Coming Up</CardTitle>
                <CardDescription>Upcoming bills and payments</CardDescription>
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
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                A complete history of your financial activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList extended />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Accounts</CardTitle>
              <CardDescription>
                Manage your bank and investment accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Categories</CardTitle>
              <CardDescription>
                Manage and customize your spending categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriesList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>
                  Your investment growth over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseChart />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>
                  How your investments are distributed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssetAllocation />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock Holdings</CardTitle>
              <CardDescription>Your current stock portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <StockTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>
                Track your spending against budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-purple-500" />
                      <span className="text-sm font-medium">Rent</span>
                    </div>
                    <span className="text-sm">$1,500 / $1,500</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-full rounded-full bg-purple-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-indigo-500" />
                      <span className="text-sm font-medium">Groceries</span>
                    </div>
                    <span className="text-sm">$420 / $500</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[84%] rounded-full bg-indigo-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-orange-500" />
                      <span className="text-sm font-medium">Entertainment</span>
                    </div>
                    <span className="text-sm">$180 / $200</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[90%] rounded-full bg-orange-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500" />
                      <span className="text-sm font-medium">Utilities</span>
                    </div>
                    <span className="text-sm">$150 / $300</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-1/2 rounded-full bg-green-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500" />
                      <span className="text-sm font-medium">
                        Transportation
                      </span>
                    </div>
                    <span className="text-sm">$120 / $200</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[60%] rounded-full bg-blue-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsPanel />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default NewOverview;

function AccountsList() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Chase Checking</h3>
            <p className="text-sm text-muted-foreground">Primary Account</p>
          </div>
          <div className="text-right">
            <p className="font-medium">$8,245.32</p>
            <p className="text-xs text-muted-foreground">Available Balance</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Chase Savings</h3>
            <p className="text-sm text-muted-foreground">Emergency Fund</p>
          </div>
          <div className="text-right">
            <p className="font-medium">$4,317.68</p>
            <p className="text-xs text-muted-foreground">Available Balance</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Fidelity Investment</h3>
            <p className="text-sm text-muted-foreground">Retirement Account</p>
          </div>
          <div className="text-right">
            <p className="font-medium">$12,000.00</p>
            <p className="text-xs text-muted-foreground">Current Value</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4 border-dashed">
        <div className="flex items-center justify-center p-4">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add New Account
          </Button>
        </div>
      </div>
    </div>
  );
}

function CategoriesList() {
  const categories = [
    {
      name: "Housing",
      color: "bg-purple-500",
      subcategories: ["Rent", "Mortgage", "Property Tax", "Home Insurance"],
    },
    {
      name: "Food",
      color: "bg-indigo-500",
      subcategories: ["Groceries", "Restaurants", "Fast Food", "Coffee Shops"],
    },
    {
      name: "Transportation",
      color: "bg-blue-500",
      subcategories: ["Gas", "Public Transit", "Car Insurance", "Maintenance"],
    },
    {
      name: "Utilities",
      color: "bg-green-500",
      subcategories: ["Electricity", "Water", "Internet", "Phone"],
    },
    {
      name: "Entertainment",
      color: "bg-orange-500",
      subcategories: ["Movies", "Concerts", "Subscriptions", "Hobbies"],
    },
  ];

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.name} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full ${category.color}`} />
            <h3 className="font-medium">{category.name}</h3>
          </div>
          <div className="ml-6 grid grid-cols-2 gap-2">
            {category.subcategories.map((sub) => (
              <div key={sub} className="rounded-md bg-muted px-3 py-1 text-sm">
                {sub}
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add New Category
      </Button>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2"
              defaultValue="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-md border px-3 py-2"
              defaultValue="john.doe@example.com"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Toggle dark mode on or off
              </p>
            </div>
            <div className="h-6 w-11 rounded-full bg-primary p-1">
              <div className="ml-auto h-4 w-4 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email notifications
              </p>
            </div>
            <div className="h-6 w-11 rounded-full bg-primary p-1">
              <div className="ml-auto h-4 w-4 rounded-full bg-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <select className="w-full rounded-md border px-3 py-2">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
              <option>JPY (¥)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
