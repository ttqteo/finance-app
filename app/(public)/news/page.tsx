import NewsClient from "./client";
import Parser from "rss-parser";

export interface INews {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  generator: string;
}

// async function getNews() {
//   const parser = new Parser();
//   const feed = await parser.parseURL("https://vneconomy.vn/chung-khoan.rss");

//   const groupedArray = Object.entries(
//     feed.items.reduce((acc, item) => {
//       const date = new Date(item.pubDate ?? Date.now())
//         .toISOString()
//         .split("T")[0]; // Extract YYYY-MM-DD
//       if (!acc[date]) {
//         acc[date] = [];
//       }
//       acc[date].push({
//         ...item,
//         contentEncoded: item["content:encoded"],
//         contentEncodedSnippet: item["content:encodedSnippet"],
//       });
//       return acc;
//     }, {})
//   ).map(([date, data]) => ({ date, data })) as [
//     { date: string; data: INews[] }
//   ];

//   return {
//     data: groupedArray,
//   };
// }

// function decodeHTMLEntities(text: string) {
//   const textarea = document.createElement("textarea");
//   textarea.innerHTML = text;
//   return textarea.value;
// }

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
    // const response = await fetch(
    //   `/api/public/news?url=${encodeURIComponent(url)}`
    // );
    const feed = await parser.parseURL(url);
    // const response = await fetch(`/api/public/news/vneconomy`);
    // const xml = await response.text();
    // const jsonData = parser.parse(xml);

    // const items = jsonData.rss.channel.item.map((item: any) => ({
    //   title: item.title,
    //   link: item.link,
    //   pubDate: item.pubDate,
    //   description: decodeHTMLEntities(
    //     item["content:encoded"] ?? item["description"] ?? ""
    //   ),
    //   generator,
    // }));

    const items = feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item["content:encoded"] ?? item["description"] ?? "",
      generator,
    })) as INews[];
    // Object.entries(
    //   feed.items.reduce((acc, item) => {
    //     const date = new Date(item.pubDate ?? Date.now())
    //       .toISOString()
    //       .split("T")[0]; // Extract YYYY-MM-DD
    //     if (!acc[date]) {
    //       acc[date] = [];
    //     }
    //     acc[date].push({
    //       title: item.title,
    //       link: item.link,
    //       pubDate: item.pubDate,
    //       description: decodeHTMLEntities(
    //         item["content:encoded"] ?? item["description"] ?? ""
    //       ),
    //       generator,
    //     });
    //     return acc;
    //   }, {})
    // ).map(([date, data]) => ({ date, data })) as [
    //   { date: string; data: INews[] }
    // ];

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
  console.log({ news });
  return <NewsClient data={news} />;
}
