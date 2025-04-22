import { DataChart } from "@/components/dashboard/data-chart";
import { DataGrid } from "@/components/dashboard/data-grid";
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
