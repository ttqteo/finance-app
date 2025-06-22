"use client";

import { CryptoCoinsHeatmap } from "react-ts-tradingview-widgets";

export default function CryptoHeatmapWidget() {
  return (
    <div>
      <CryptoCoinsHeatmap colorTheme="dark" height={600}></CryptoCoinsHeatmap>
    </div>
  );
}
