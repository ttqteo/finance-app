"use client";

import { Market, Timeline } from "react-ts-tradingview-widgets";

export default function TimelineWidget({ market }: { market: Market }) {
  return (
    <div>
      <Timeline
        colorTheme="dark"
        feedMode="market"
        market={market}
        height={400}
        width="100%"
      ></Timeline>
    </div>
  );
}
