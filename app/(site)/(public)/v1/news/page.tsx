import Parser from "rss-parser";
import NewsClient from "../../../../../components/v1/news-client";

export interface INews {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  generator: string;
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
};

async function getNews() {
  const parser = new Parser();

  const rssUrls = [
    {
      url: "https://vneconomy.vn/chung-khoan.rss",
      generator: "VnEconomy",
    },
    {
      url: "https://vietstock.vn/830/chung-khoan/co-phieu.rss",
      generator: "VietStock",
    },
  ];

  const allItems: INews[] = [];

  for (const { url, generator } of rssUrls) {
    const feed = await parser.parseURL(url);

    const items = feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item["content:encoded"] ?? item["description"] ?? "",
      generator,
    })) as INews[];

    allItems.push(...items);
  }

  const groupedArray = Object.entries(
    allItems.reduce((acc: Record<string, INews[]>, item: INews) => {
      const date = new Date(item.pubDate ?? Date.now())
        .toISOString()
        .split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {})
  ).map(([date, data]) => ({
    date,
    data: data.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    ) as INews[],
  }));

  groupedArray.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return groupedArray;
}

export default async function NewsPage() {
  const news = await getNews();
  return <NewsClient data={news} />;
}
