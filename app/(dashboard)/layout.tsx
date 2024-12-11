import Header from "@/components/header";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

type Props = {
  children: React.ReactNode;
};
export default async function DashboardLayout({ children }: Props) {
  const messages = await getMessages();

  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <Header />
        <main className="px-3 lg:px-14">{children}</main>
      </NextIntlClientProvider>
    </>
  );
}
