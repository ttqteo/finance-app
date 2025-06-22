"use client";

import { useTheme } from "next-themes";
import { TechnicalAnalysis } from "react-ts-tradingview-widgets";

export default function TechnicalAnalysisWidget({
  symbol,
}: {
  symbol: string;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <TechnicalAnalysis
        colorTheme={(resolvedTheme ?? "dark") as "light" | "dark"}
        width="100%"
        interval="1D"
        height={600}
        symbol={symbol}
        locale="vi_VN"
      />
    </div>
  );
}
