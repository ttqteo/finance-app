import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
