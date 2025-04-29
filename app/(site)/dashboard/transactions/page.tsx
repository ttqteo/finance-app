import TransactionsPage from "@/components/dashboard/transactions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
};

const Page = () => {
  return (
    <>
      <TransactionsPage />
    </>
  );
};

export default Page;
