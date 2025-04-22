"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock financial news data
const newsData = [
  {
    id: 1,
    title: "Fed Signals Potential Rate Cuts in Coming Months",
    source: "Financial Times",
    category: "Economy",
    date: new Date(2023, 11, 14, 10, 30),
    summary:
      "Federal Reserve officials indicated they could begin cutting interest rates in the coming months if inflation continues to cool, minutes from their latest meeting showed.",
    url: "#",
    relatedStocks: ["JPM", "GS", "BAC"],
  },
  {
    id: 2,
    title: "Tech Giants Face New Antitrust Scrutiny",
    source: "Wall Street Journal",
    category: "Technology",
    date: new Date(2023, 11, 14, 9, 15),
    summary:
      "Regulators are preparing a new round of investigations into market dominance by major technology companies, focusing on cloud services and AI development.",
    url: "#",
    relatedStocks: ["AAPL", "MSFT", "GOOGL", "AMZN"],
  },
  {
    id: 3,
    title: "Oil Prices Surge Amid Middle East Tensions",
    source: "Bloomberg",
    category: "Commodities",
    date: new Date(2023, 11, 13, 16, 45),
    summary:
      "Crude oil prices jumped 3% today as geopolitical tensions in the Middle East raised concerns about potential supply disruptions.",
    url: "#",
    relatedStocks: ["XOM", "CVX", "BP"],
  },
  {
    id: 4,
    title: "Pharmaceutical Merger Creates Industry Giant",
    source: "Reuters",
    category: "Healthcare",
    date: new Date(2023, 11, 13, 11, 20),
    summary:
      "Two major pharmaceutical companies announced a $45 billion merger, creating one of the largest healthcare corporations globally.",
    url: "#",
    relatedStocks: ["PFE", "JNJ", "MRK"],
  },
  {
    id: 5,
    title: "Retail Sales Beat Expectations in November",
    source: "CNBC",
    category: "Economy",
    date: new Date(2023, 11, 12, 14, 10),
    summary:
      "U.S. retail sales rose 0.8% in November, exceeding economists' expectations and signaling strong consumer spending heading into the holiday season.",
    url: "#",
    relatedStocks: ["WMT", "TGT", "AMZN"],
  },
  {
    id: 6,
    title: "Electric Vehicle Maker Announces New Battery Technology",
    source: "TechCrunch",
    category: "Technology",
    date: new Date(2023, 11, 12, 9, 30),
    summary:
      "A leading electric vehicle manufacturer unveiled new battery technology claiming to increase range by 40% while reducing charging time by half.",
    url: "#",
    relatedStocks: ["TSLA", "F", "GM"],
  },
];

// Mock market insights
const marketInsights = [
  {
    id: 1,
    title: "Weekly Market Outlook",
    author: "Jane Smith, Chief Market Strategist",
    date: new Date(2023, 11, 14),
    content:
      "Markets are approaching year-end with cautious optimism. While inflation concerns persist, recent data suggests the Fed's policies are having the desired effect. We expect volatility to decrease in the coming weeks as trading volumes thin out for the holiday season. Key sectors to watch include technology and consumer discretionary.",
  },
  {
    id: 2,
    title: "Sector Rotation Analysis",
    author: "Michael Johnson, Senior Analyst",
    date: new Date(2023, 11, 13),
    content:
      "We're seeing significant rotation from growth to value stocks as interest rate expectations shift. Financial and energy sectors are benefiting from this trend, while high-multiple tech stocks face headwinds. This rotation pattern typically occurs late in economic cycles and may signal changing market leadership for the coming quarter.",
  },
];

export function FinancialNews() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredNews = activeCategory
    ? newsData.filter((news) => news.category === activeCategory)
    : newsData;

  const categories = Array.from(new Set(newsData.map((news) => news.category)));

  return (
    <Tabs defaultValue="latest" className="space-y-4">
      <TabsList>
        <TabsTrigger value="latest">Latest News</TabsTrigger>
        <TabsTrigger value="insights">Market Insights</TabsTrigger>
      </TabsList>

      <TabsContent value="latest" className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {filteredNews.map((news) => (
            <div key={news.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{news.title}</h3>
                <Badge variant="outline">{news.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{news.summary}</p>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">{news.source}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {format(news.date, "MMM d, h:mm a")}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1">
                  <ExternalLink className="h-3 w-3" />
                  <span className="text-xs">Read more</span>
                </Button>
              </div>
              {news.relatedStocks && news.relatedStocks.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {news.relatedStocks.map((stock) => (
                    <Badge key={stock} variant="secondary" className="text-xs">
                      {stock}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="insights" className="space-y-4">
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {marketInsights.map((insight) => (
            <div key={insight.id} className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium">{insight.title}</h3>
              <div className="text-xs text-muted-foreground">
                {insight.author} • {format(insight.date, "MMMM d, yyyy")}
              </div>
              <p className="text-sm">{insight.content}</p>
              <Button variant="ghost" size="sm" className="h-7 gap-1">
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">Read full analysis</span>
              </Button>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
