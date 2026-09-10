import { DataChart } from "@/components/dashboard/data-chart";
import { DataGrid } from "@/components/dashboard/data-grid";
import NewOverview from "@/components/dashboard/overview";
import WelcomeMessage from "@/components/dashboard/welcome-message";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

const Page = () => {
  return (
    <>
      <WelcomeMessage />
      <DataGrid />
      <DataChart />
      <NewOverview />
    </>
  );
};

export default Page;
