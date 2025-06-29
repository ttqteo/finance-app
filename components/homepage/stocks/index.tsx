"use client";

import { getLocale } from "@/lib/utils";
import { format } from "date-fns";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import MarketOverviewWidget from "../widget/market-overview";
import StockMarketWidget from "../widget/stock-market";
import ComfortableDisplay from "./comfortable-display";
import FullDisplay from "./full-display";
import MinimalDisplay from "./minimal-display";

const StockPage = ({ data }: { data: any }) => {
  const now = new Date();
  const { locale, formatNormal } = getLocale("vi");

  const [displayRadio, setDisplayRadio] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const displayStock = localStorage.getItem("displayStock");
      if (displayStock) {
        setDisplayRadio(displayStock);
      } else {
        localStorage.setItem("displayStock", "comfortable");
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          {format(now, formatNormal, { locale })}
        </h4>
        <p className="leading-7 text-sm">(*) Chỉ áp dụng thị trường Việt Nam</p>
      </div>
      <div className="flex gap-4">
        <span>Hiển thị</span>
        <RadioGroup
          value={displayRadio}
          className="flex gap-4"
          onValueChange={(val) => {
            setDisplayRadio(val);
            localStorage.setItem("displayStock", val);
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="minimal" id="r1" />
            <Label htmlFor="r1">Siêu Gọn</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comfortable" id="r2" />
            <Label htmlFor="r2">Gọn</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full" id="r3" />
            <Label htmlFor="r3">Đầy đủ</Label>
          </div>
        </RadioGroup>
      </div>

      {displayRadio === "comfortable" && <ComfortableDisplay data={data} />}
      {displayRadio === "full" && <FullDisplay data={data} />}
      {displayRadio === "minimal" && <MinimalDisplay data={data} />}

      <Separator className="mt-10" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2">Tổng Quan Thị Trường Mỹ</p>
          <MarketOverviewWidget />
        </div>
        <div>
          <p className="mb-2">Thị Trường</p>
          <StockMarketWidget />
        </div>
      </div>
    </div>
  );
};

export default StockPage;
