import ChartPage from "@/components/homepage/chart";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chart",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ChartPage />
    </>
  );
};

export default Layout;
