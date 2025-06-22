"use client";

import { EconomicCalendar } from "react-ts-tradingview-widgets";

export default function EconomicCalendarWdiget() {
  return (
    <EconomicCalendar
      colorTheme="dark"
      height={600}
      width="100%"
      locale="vi_VN"
      importanceFilter="0,1"
    ></EconomicCalendar>
  );
}
