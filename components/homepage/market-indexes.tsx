"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Mock data for Vietnamese indexes
const vietnameseIndexes = [
  {
    name: "VN-Index",
    current: 1245.78,
    change: 12.45,
    changePercent: 1.01,
    data: Array(30)
      .fill(0)
      .map((_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        value: 1200 + Math.random() * 100,
      })),
  },
  {
    name: "HNX-Index",
    current: 235.67,
    change: -1.23,
    changePercent: -0.52,
    data: Array(30)
      .fill(0)
      .map((_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        value: 230 + Math.random() * 20,
      })),
  },
  {
    name: "UPCOM-Index",
    current: 89.45,
    change: 0.67,
    changePercent: 0.75,
    data: Array(30)
      .fill(0)
      .map((_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        value: 85 + Math.random() * 10,
      })),
  },
];

// Mock data for international indexes
const internationalIndexes = [
  {
    name: "Dow Jones",
    current: 38756.23,
    change: 145.67,
    changePercent: 0.38,
    data: Array(30)
      .fill(0)
      .map((_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        value: 38500 + Math.random() * 500,
      })),
  },
  {
    name: "S&P 500",
    current: 5234.56,
    change: 23.45,
    changePercent: 0.45,
    data: Array(30)
      .fill(0)
      .map((_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        value: 5200 + Math.random() * 100,
      })),
  },
  {
    name: "NASDAQ",
    current: 16789.34,
    change: -45.67,
    changePercent: -0.27,
    data: Array(30)
      .fill(0)
      .map((_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        value: 16700 + Math.random() * 200,
      })),
  },
  {
    name: "Nikkei 225",
    current: 38245.67,
    change: 234.56,
    changePercent: 0.62,
    data: Array(30)
      .fill(0)
      .map((_, i) => ({
        date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
        value: 38000 + Math.random() * 500,
      })),
  },
];

// Mock data for economic events
const economicEvents = [
  {
    date: new Date(2023, 11, 15),
    event: "Fed Interest Rate Decision",
    impact: "High",
    forecast: "5.25%",
    previous: "5.25%",
  },
  {
    date: new Date(2023, 11, 16),
    event: "US CPI Data Release",
    impact: "High",
    forecast: "3.1%",
    previous: "3.2%",
  },
  {
    date: new Date(2023, 11, 18),
    event: "ECB Monetary Policy Statement",
    impact: "Medium",
    forecast: "4.0%",
    previous: "4.0%",
  },
  {
    date: new Date(2023, 11, 20),
    event: "US Retail Sales",
    impact: "Medium",
    forecast: "0.3%",
    previous: "0.2%",
  },
  {
    date: new Date(2023, 11, 22),
    event: "Japan GDP Growth Rate",
    impact: "Medium",
    forecast: "1.2%",
    previous: "1.1%",
  },
];

export function MarketIndexes() {
  const [selectedIndex, setSelectedIndex] = useState(vietnameseIndexes[0]);
  const [activeTab, setActiveTab] = useState<string>("vietnamese");

  const handleSelectChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
      <div className="hidden sm:block">
        <TabsList className="grid w-full sm:grid-cols-3">
          <TabsTrigger value="vietnamese">Vietnamese</TabsTrigger>
          <TabsTrigger value="international">International</TabsTrigger>
          <TabsTrigger value="economic">Economic Events</TabsTrigger>
        </TabsList>
      </div>

      <div className="sm:hidden">
        <Select value={activeTab} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-full p-2 border rounded">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vietnamese">Vietnamese</SelectItem>
            <SelectItem value="international">International</SelectItem>
            <SelectItem value="economic">Economic Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="vietnamese" className="space-y-4">
        <div className="grid sm:grid-cols-3 grid-cols-1 gap-4">
          {vietnameseIndexes.map((index) => (
            <div
              key={index.name}
              className={`rounded-lg border p-3 cursor-pointer ${
                selectedIndex.name === index.name
                  ? "border-primary bg-accent"
                  : ""
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="font-medium">{index.name}</div>
              <div className="text-2xl font-bold">
                {index.current.toFixed(2)}
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={
                    index.changePercent >= 0
                      ? "text-emerald-500 border-emerald-200"
                      : "text-rose-500 border-rose-200"
                  }
                >
                  {index.changePercent >= 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {index.change >= 0 ? "+" : ""}
                  {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[250px] mt-4 relative z-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedIndex.data}>
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "dd/MM")}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {format(
                                new Date(payload[0].payload.date),
                                "dd MMM yyyy"
                              )}
                            </span>
                            <span className="text-xs font-bold">
                              {typeof payload[0].value === "number"
                                ? payload[0].value.toFixed(2)
                                : payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  selectedIndex.changePercent >= 0
                    ? "hsl(142, 71%, 45%)"
                    : "hsl(356, 100%, 66%)"
                }
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="international" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {internationalIndexes.map((index) => (
            <div
              key={index.name}
              className={`rounded-lg border p-3 cursor-pointer ${
                selectedIndex.name === index.name
                  ? "border-primary bg-accent"
                  : ""
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="font-medium">{index.name}</div>
              <div className="text-2xl font-bold">
                {index.current.toFixed(2)}
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={
                    index.changePercent >= 0
                      ? "text-emerald-500 border-emerald-200"
                      : "text-rose-500 border-rose-200"
                  }
                >
                  {index.changePercent >= 0 ? (
                    <ArrowUp className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3" />
                  )}
                  {index.change >= 0 ? "+" : ""}
                  {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[250px] mt-4 relative z-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedIndex.data}>
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "dd/MM")}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {format(
                                new Date(payload[0].payload.date),
                                "dd MMM yyyy"
                              )}
                            </span>
                            <span className="text-xs font-bold">
                              {typeof payload[0].value === "number"
                                ? payload[0].value.toFixed(2)
                                : payload[0].value}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  selectedIndex.changePercent >= 0
                    ? "hsl(142, 71%, 45%)"
                    : "hsl(356, 100%, 66%)"
                }
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="economic" className="space-y-4">
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3.5 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-4 py-3.5 text-left text-sm font-semibold">
                  Event
                </th>
                <th className="px-4 py-3.5 text-center text-sm font-semibold">
                  Impact
                </th>
                <th className="px-4 py-3.5 text-right text-sm font-semibold">
                  Forecast
                </th>
                <th className="px-4 py-3.5 text-right text-sm font-semibold">
                  Previous
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {economicEvents.map((event, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {format(event.date, "MMM dd, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {event.event}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <Badge
                      variant="outline"
                      className={
                        event.impact === "High"
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : event.impact === "Medium"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-emerald-100 text-emerald-700 border-emerald-200"
                      }
                    >
                      {event.impact}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                    {event.forecast}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                    {event.previous}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
