import vnstock from "@/lib/vnstock";
import StockPage from "@/components/homepage/stocks";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stocks",
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ share?: string }>;
}) => {
  const { share } = await searchParams;
  const shareList = share?.split(",") ?? [
    "TCH",
    "MBB",
    "ACB",
    "HPG",
    "TCB",
    "FPT",
  ];
  const data = await vnstock.trading.priceBoard(shareList);
  return (
    <div className="max-w-screen-2xl mx-auto w-full">
      <StockPage data={data} />
    </div>
  );
};

export default Page;
