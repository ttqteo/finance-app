"use client";

import { useTheme } from "next-themes";
import { MarketOverview } from "react-ts-tradingview-widgets";

export default function MarketOverviewWidget() {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <MarketOverview
        colorTheme={(resolvedTheme ?? "dark") as "light" | "dark"}
        height={600}
        width="100%"
        locale="vi_VN"
      />
    </div>
  );
}
