"use client";

import { useSearchParams } from "next/navigation";
import AdvancedRealTimeChartWidget from "../widget/advanced-realtime-chart";
import FundamentalDataWidget from "../widget/fundamental-data";
import TechnicalAnalysisWidget from "../widget/technical-analysis";

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
        <AdvancedRealTimeChartWidget symbol={symbol ?? DEFAULT_SYMBOL} />
      </div>
      <div className="col-span-5">
        <FundamentalDataWidget symbol={symbol ?? DEFAULT_SYMBOL} />
      </div>
      <div className="col-span-2">
        <TechnicalAnalysisWidget symbol={symbol ?? DEFAULT_SYMBOL} />
      </div>
    </div>
  );
}
