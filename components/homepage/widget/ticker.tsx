"use client";

import { useTheme } from "next-themes";
import { Ticker } from "react-ts-tradingview-widgets";

export default function TickerWidget() {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <Ticker colorTheme={(resolvedTheme ?? "dark") as "light" | "dark"} />
    </div>
  );
}
