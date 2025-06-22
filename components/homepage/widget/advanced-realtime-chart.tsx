"use client";

import { useTheme } from "next-themes";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

export default function AdvancedRealTimeChartWidget({
  symbol,
}: {
  symbol: string;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      <AdvancedRealTimeChart
        theme={(resolvedTheme ?? "dark") as "light" | "dark"}
        interval="D"
        width="100%"
        height={600}
        symbol={symbol}
        hotlist
        locale="vi_VN"
        timezone="Asia/Ho_Chi_Minh"
        save_image={false}
      />
    </div>
  );
}
