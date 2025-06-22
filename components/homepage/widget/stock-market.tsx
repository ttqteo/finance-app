"use client";

import { useTheme } from "next-themes";
import { StockMarket } from "react-ts-tradingview-widgets";

export default function StockMarketWidget() {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <StockMarket
        colorTheme={(resolvedTheme ?? "dark") as "light" | "dark"}
        height={600}
        width="100%"
        locale="vi_VN"
      />
    </div>
  );
}
