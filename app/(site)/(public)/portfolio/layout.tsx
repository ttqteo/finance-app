import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
