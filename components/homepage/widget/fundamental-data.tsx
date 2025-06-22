"use client";

import { useTheme } from "next-themes";
import { FundamentalData } from "react-ts-tradingview-widgets";

export default function FundamentalDataWidget({ symbol }: { symbol: string }) {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <FundamentalData
        colorTheme={(resolvedTheme ?? "dark") as "light" | "dark"}
        height={600}
        width="100%"
        symbol={symbol}
        locale="vi_VN"
      />
    </div>
  );
}
