"use client";

import { useTheme } from "next-themes";
import { Market, Timeline } from "react-ts-tradingview-widgets";

export default function TimelineWidget({ market }: { market: Market }) {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <Timeline
        colorTheme={(resolvedTheme ?? "dark") as "light" | "dark"}
        feedMode="market"
        market={market}
        height={400}
        width="100%"
        locale="vi_VN"
      ></Timeline>
    </div>
  );
}
