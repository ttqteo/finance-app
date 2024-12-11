import Header from "@/components/header";
import LoadConfigs from "@/config/load-config";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

type Props = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: Props) {
  return (
    <>
      <LoadConfigs />
      <Header />
      <main className="px-3 lg:px-14">{children}</main>
    </>
  );
}
