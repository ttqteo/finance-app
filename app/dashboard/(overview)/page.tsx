import { DataChart } from "@/components/data-chart";
import { DataGrid } from "@/components/data-grid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

const DashboardPage = () => {
  return (
    <>
      <DataGrid />
      <DataChart />
    </>
  );
};

export default DashboardPage;
