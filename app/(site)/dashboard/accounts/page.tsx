import AccountsPage from "@/components/dashboard/accounts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounts",
};
const Page = () => {
  return (
    <>
      <AccountsPage />
    </>
  );
};

export default Page;
