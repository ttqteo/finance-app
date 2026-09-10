import { ClientOnly } from "@/components/client-only";
import { DataChart } from "@/components/dashboard/data-chart";
import { DataGrid } from "@/components/dashboard/data-grid";
import NewOverview from "@/components/dashboard/overview";
import { OverviewSkeleton } from "@/components/dashboard/skeletons";
import WelcomeMessage from "@/components/dashboard/welcome-message";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

const Page = () => {
  return (
    // The same skeleton the route's loading.tsx draws, so a hard load goes
    // skeleton -> content with no layout change at the hydration handover.
    <ClientOnly fallback={<OverviewSkeleton />}>
      <WelcomeMessage />
      <DataGrid />
      <DataChart />
      <NewOverview />
    </ClientOnly>
  );
};

export default Page;
