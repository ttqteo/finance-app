"use client";

import { useSearchParams } from "next/navigation";
import {
  AdvancedRealTimeChart,
  FundamentalData,
  TechnicalAnalysis,
} from "react-ts-tradingview-widgets";

const DEFAULT_SYMBOL = "HNX:MBS";

export default function ChartPage() {
  const searchParams = useSearchParams();

  const symbol = searchParams.get("symbol");

  return (
    <div className="grid grid-cols-7 gap-4">
      <div className="col-span-7">
        <p className="leading-7 text-sm">
          (*) Thị trường Việt Nam chỉ hỗ trợ HNX và UPCOM, chưa có HOSE
        </p>
      </div>

      <div className="col-span-7">
        <AdvancedRealTimeChart
          theme="dark"
          interval="D"
          width="100%"
          height={600}
          symbol={symbol ?? DEFAULT_SYMBOL}
          hotlist
          locale="vi_VN"
          timezone="Asia/Ho_Chi_Minh"
          save_image={false}
        />
      </div>
      <div className="col-span-5">
        <FundamentalData
          colorTheme="dark"
          height={600}
          width="100%"
          symbol={symbol ?? DEFAULT_SYMBOL}
          locale="vi_VN"
        ></FundamentalData>
      </div>
      <div className="col-span-2">
        <TechnicalAnalysis
          colorTheme="dark"
          width="100%"
          interval="1D"
          height={600}
          symbol={symbol ?? DEFAULT_SYMBOL}
          locale="vi_VN"
        />
      </div>
    </div>
  );
}
