"use client";

import { DataChart } from "@/components/data-chart";
import { DataGrid } from "@/components/data-grid";

const DashboardPage = () => {
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <DataGrid />
      <DataChart />
    </div>
  );
};

export default DashboardPage;
