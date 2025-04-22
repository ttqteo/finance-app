"use client";

import { Spinner } from "@/components/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns-tz";
import Image from "next/image";
import Link from "next/link";
import { INews } from "../../app/(public)/v1/news/page";

const generatorList = [
  {
    name: "VnEconomy",
    logoUrl: "/images/vneconomy-logo.jpg",
  },
  {
    name: "VietStock",
    logoUrl: "/images/vietstock-logo.png",
  },
];

export default function NewsClient({
  data,
}: {
  data: { date: string; data: INews[] }[];
}) {
  if (!data) return <Spinner />;

  return (
    <div className="w-full mx-auto flex flex-col gap-1 sm:min-h-[91vh] min-h-[88vh] pt-2">
      <h1 className="text-3xl font-extrabold">Tin tức</h1>
      <p className="text-muted-foreground">
        Từ mục Chứng Khoán của VnEconomy và VietStock.
      </p>
      <div className="flex flex-col mb-5">
        <div className="grid grid-cols-1 gap-2">
          {/* <div className="col-span-2"> */}
          {data?.map(({ date, data }) => (
            <div key={date}>
              <p className="py-1">{date}</p>
              {data.map((item) => (
                <NewsCard {...item} key={item.link} />
              ))}
            </div>
          ))}
          {/* </div> */}
          {/* <div className="basis-1/3">Hello</div> */}
        </div>
      </div>
    </div>
  );
}

function NewsCard({ title, link, pubDate, description, generator }: INews) {
  const words = description.split(/\s+/);
  const wordsLimit = 60;
  const content =
    words.length > wordsLimit
      ? words.slice(0, wordsLimit).join(" ") + "..."
      : description;
  const generatorInfo = generatorList.filter((g) => g.name === generator)[0];
  return (
    <Link
      href={link}
      className="flex gap-2 items-start border rounded-md pl-2"
      target="_blank"
    >
      <TooltipProvider skipDelayDuration={0} delayDuration={0}>
        <Tooltip>
          <TooltipTrigger className="max-w-full">
            <div className="flex justify-between items-center gap-2">
              {generatorInfo && (
                <Image
                  src={generatorInfo.logoUrl}
                  width={20}
                  height={20}
                  alt="generator logo"
                />
              )}
              <p className="text-[13px] text-right text-muted-foreground w-[60px]">
                {format(new Date(pubDate), "p", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
              </p>
              <span className="py-1 pr-7 truncate overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 text-primary underline-offset-4 hover:underline">
                {title}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side={"left"}>
            <div className="max-w-[400px]">
              <span className="font-semibold">{title}</span>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Link>
  );
}
