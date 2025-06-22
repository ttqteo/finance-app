"use client";

import { useTheme } from "next-themes";
import { CryptoCoinsHeatmap } from "react-ts-tradingview-widgets";

export default function CryptoHeatmapWidget() {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <CryptoCoinsHeatmap
        colorTheme={(resolvedTheme ?? "dark") as "light" | "dark"}
        height={600}
      />
    </div>
  );
}
