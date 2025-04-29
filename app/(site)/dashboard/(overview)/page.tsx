import { DataChart } from "@/components/dashboard/data-chart";
import { DataGrid } from "@/components/dashboard/data-grid";
import NewOverview from "@/components/dashboard/overview";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

const Page = () => {
  return (
    <>
      <DataGrid />
      <DataChart />
      <NewOverview />
    </>
  );
};

export default Page;
