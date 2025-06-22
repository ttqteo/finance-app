"use client";

import { StockHeatmap } from "react-ts-tradingview-widgets";

export default function StockHeatmapWidget() {
  return (
    <div>
      <StockHeatmap colorTheme="dark" height={600}></StockHeatmap>
    </div>
  );
}
