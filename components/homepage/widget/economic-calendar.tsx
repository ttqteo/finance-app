"use client";

import { useTheme } from "next-themes";
import { EconomicCalendar } from "react-ts-tradingview-widgets";

export default function EconomicCalendarWdiget() {
  const { resolvedTheme } = useTheme();

  return (
    <EconomicCalendar
      colorTheme={(resolvedTheme ?? "dark") as "light" | "dark"}
      height={600}
      width="100%"
      locale="vi_VN"
      importanceFilter="0,1"
    />
  );
}
