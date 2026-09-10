import ChartPage from "@/components/homepage/chart";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart",
};

// A page receives `params` and `searchParams`, never `children`. This was a
// layout signature, and `next build` (webpack) rejects it as an invalid page
// export — Turbopack builds in 15.3 skip that check, which hid it.
const Page = () => {
  return <ChartPage />;
};

export default Page;
