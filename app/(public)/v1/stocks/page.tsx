import vnstock from "@/lib/vnstock";
import StockClient from "./client";

const StockPage = async ({
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
      <StockClient data={data} />
    </div>
  );
};

export default StockPage;
