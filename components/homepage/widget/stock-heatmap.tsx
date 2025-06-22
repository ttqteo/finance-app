"use client";

import { useTheme } from "next-themes";
import { StockHeatmap } from "react-ts-tradingview-widgets";

export default function StockHeatmapWidget() {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <StockHeatmap
        colorTheme={(resolvedTheme ?? "dark") as "light" | "dark"}
        height={600}
      ></StockHeatmap>
    </div>
  );
}
