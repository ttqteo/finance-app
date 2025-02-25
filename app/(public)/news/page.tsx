import { getLocale } from "@/lib/utils";
import { format } from "date-fns";
import { Metadata } from "next";
import Link from "next/link";
import Parser from "rss-parser";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "News",
};

interface INews {
  categories: string[];
  content: string;
  contentEncoded: string;
  contentEncodedSnippet: string;
  encodedSnippet: string;
  guid: string;
  isoDate: string;
  link: string;
  pubDate: string;
  title: string;
}

async function getNews() {
  const parser = new Parser();
  const feed = await parser.parseURL("https://vneconomy.vn/chung-khoan.rss");

  const groupedArray = Object.entries(
    feed.items.reduce((acc, item) => {
      const date = new Date(item.pubDate ?? Date.now())
        .toISOString()
        .split("T")[0]; // Extract YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        ...item,
        contentEncoded: item["content:encoded"],
        contentEncodedSnippet: item["content:encodedSnippet"],
      });
      return acc;
    }, {})
  ).map(([date, data]) => ({ date, data })) as [
    { date: string; data: INews[] }
  ];

  return {
    data: groupedArray,
  };
}

export default async function NewsPage() {
  const news = await getNews();
  return (
    <div className="w-full mx-auto flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold">Tin tức</h1>
        <p className="text-muted-foreground">
          Từ mục Chứng Khoán của VnEconomy.
        </p>
      </div>
      <div className="flex flex-col mb-5">
        {news?.data.map(({ date, data }) => (
          <div key={date}>
            <p className="py-1">{date}</p>
            <div className="grid grid-cols-2">
              {data.map((item) => (
                <NewsCard {...item} key={item.guid} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsCard({
  categories,
  content,
  encodedSnippet,
  contentEncodedSnippet,
  guid,
  isoDate,
  link,
  pubDate,
  title,
}: INews) {
  const { locale } = getLocale("vi");
  const words = contentEncodedSnippet.split(/\s+/);
  const wordsLimit = 60;

  return (
    <Link
      href={link}
      className="flex gap-2 items-start border rounded-md pl-2"
      target="_blank"
    >
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <div className="flex justify-between items-center gap-4">
              <p className="text-[13px] text-muted-foreground flex gap-2 items-center">
                {format(isoDate, "p", { locale })}
              </p>
              <Button variant={"link"} className="p-0 pr-7">
                {title}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side={"left"}>
            <p className="max-w-[600px]">
              {words.length > wordsLimit
                ? words.slice(0, wordsLimit).join(" ") + "..."
                : contentEncodedSnippet}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Link>
  );
}
