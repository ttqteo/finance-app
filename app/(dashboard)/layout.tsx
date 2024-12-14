import Header from "@/components/header";
import LoadConfigs from "@/config/load-config";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <>
      <LoadConfigs />
      <Header />
      <main className="px-3 lg:px-14">{children}</main>
    </>
  );
}
