"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChartIndicatorsProps {
  activeIndicators: string[];
  onAddIndicator: (indicator: string) => void;
  onRemoveIndicator: (indicator: string) => void;
}

// List of available indicators by category
const availableIndicators = {
  trend: [
    {
      id: "MA",
      name: "Moving Average",
      description: "Simple Moving Average (SMA)",
    },
    {
      id: "EMA",
      name: "Exponential Moving Average",
      description: "Exponential weighted moving average",
    },
    {
      id: "BB",
      name: "Bollinger Bands",
      description: "Volatility bands based on standard deviation",
    },
    {
      id: "VWAP",
      name: "Volume Weighted Average Price",
      description: "Price weighted by volume",
    },
  ],
  momentum: [
    {
      id: "RSI",
      name: "Relative Strength Index",
      description: "Momentum oscillator that measures speed of price changes",
    },
    {
      id: "MACD",
      name: "MACD",
      description: "Moving Average Convergence Divergence",
    },
    {
      id: "Stochastic",
      name: "Stochastic Oscillator",
      description: "Compares closing price to price range",
    },
    {
      id: "CCI",
      name: "Commodity Channel Index",
      description: "Measures current price level relative to average price",
    },
  ],
  volume: [
    { id: "Volume", name: "Volume", description: "Trading volume" },
    {
      id: "OBV",
      name: "On-Balance Volume",
      description: "Cumulative total of volume",
    },
    {
      id: "ADL",
      name: "Accumulation/Distribution Line",
      description: "Volume-based indicator for money flow",
    },
    { id: "MFI", name: "Money Flow Index", description: "Volume-weighted RSI" },
  ],
  volatility: [
    {
      id: "ATR",
      name: "Average True Range",
      description: "Market volatility indicator",
    },
    {
      id: "Keltner",
      name: "Keltner Channels",
      description: "Volatility-based bands",
    },
    {
      id: "Donchian",
      name: "Donchian Channels",
      description: "Price channel based on highest high and lowest low",
    },
  ],
};

export function ChartIndicators({
  activeIndicators,
  onAddIndicator,
  onRemoveIndicator,
}: ChartIndicatorsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter indicators based on search query
  const filterIndicators = (indicators: typeof availableIndicators.trend) => {
    if (!searchQuery) return indicators;
    return indicators.filter(
      (indicator) =>
        indicator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        indicator.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {activeIndicators.map((indicator) => (
          <Badge
            key={indicator}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1"
          >
            {indicator}
            <button
              onClick={() => onRemoveIndicator(indicator)}
              className="ml-1 rounded-full hover:bg-muted p-0.5"
              aria-label={`Remove ${indicator} indicator`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add Indicator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Technical Indicator</DialogTitle>
              <DialogDescription>
                Select an indicator to add to your chart. You can add multiple
                indicators.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Search indicators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              <Tabs defaultValue="trend">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="trend">Trend</TabsTrigger>
                  <TabsTrigger value="momentum">Momentum</TabsTrigger>
                  <TabsTrigger value="volume">Volume</TabsTrigger>
                  <TabsTrigger value="volatility">Volatility</TabsTrigger>
                </TabsList>
                <TabsContent value="trend" className="space-y-2">
                  {filterIndicators(availableIndicators.trend).map(
                    (indicator) => (
                      <div
                        key={indicator.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => {
                          onAddIndicator(indicator.id);
                          setIsDialogOpen(false);
                        }}
                      >
                        <div>
                          <div className="font-medium">{indicator.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {indicator.description}
                          </div>
                        </div>
                        <Plus className="h-4 w-4" />
                      </div>
                    )
                  )}
                </TabsContent>
                <TabsContent value="momentum" className="space-y-2">
                  {filterIndicators(availableIndicators.momentum).map(
                    (indicator) => (
                      <div
                        key={indicator.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => {
                          onAddIndicator(indicator.id);
                          setIsDialogOpen(false);
                        }}
                      >
                        <div>
                          <div className="font-medium">{indicator.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {indicator.description}
                          </div>
                        </div>
                        <Plus className="h-4 w-4" />
                      </div>
                    )
                  )}
                </TabsContent>
                <TabsContent value="volume" className="space-y-2">
                  {filterIndicators(availableIndicators.volume).map(
                    (indicator) => (
                      <div
                        key={indicator.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => {
                          onAddIndicator(indicator.id);
                          setIsDialogOpen(false);
                        }}
                      >
                        <div>
                          <div className="font-medium">{indicator.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {indicator.description}
                          </div>
                        </div>
                        <Plus className="h-4 w-4" />
                      </div>
                    )
                  )}
                </TabsContent>
                <TabsContent value="volatility" className="space-y-2">
                  {filterIndicators(availableIndicators.volatility).map(
                    (indicator) => (
                      <div
                        key={indicator.id}
                        className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                        onClick={() => {
                          onAddIndicator(indicator.id);
                          setIsDialogOpen(false);
                        }}
                      >
                        <div>
                          <div className="font-medium">{indicator.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {indicator.description}
                          </div>
                        </div>
                        <Plus className="h-4 w-4" />
                      </div>
                    )
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          Technical indicators help identify trading opportunities by analyzing
          historical price and volume data. Click "Add Indicator" to customize
          your chart.
        </p>
      </div>
    </div>
  );
}
