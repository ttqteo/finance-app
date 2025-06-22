import EconomicCalendarWdiget from "@/components/homepage/widget/economic-calendar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sự Kiện Kinh Tế",
};

const Page = () => {
  return (
    <div className="w-full mx-auto flex flex-col gap-1 pt-2">
      <div className="mb-7 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold">Lịch Sự Kiện</h1>
        <p className="text-muted-foreground">
          Theo dõi các sự kiện quan trọng và Chỉ số Kinh tế ảnh hưởng trên thị
          trường.
        </p>
      </div>
      <EconomicCalendarWdiget />
      {/* <div className="w-full h-screen min-h-[500px] max-h-[900px] p-4 pt-0 bg-white overflow-hidden">
        <iframe
          src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&amp;category=_employment,_economicActivity,_inflation,_credit,_centralBanks,_confidenceIndex,_balance,_Bonds&amp;importance=2,3&amp;features=datepicker,timeselector,filters&amp;countries=33,14,4,34,38,32,6,11,51,5,39,72,60,110,43,35,71,22,36,26,12,9,37,25,178,10,17&amp;calType=week&amp;timeZone=27&amp;lang=52"
          width="100%"
          className="h-screen min-h-[500px] max-h-[900px]"
          allowTransparency={true}
        ></iframe>
      </div> */}
    </div>
  );
};

export default Page;
