import { Metadata } from "next";
import TransactionsClient from "./client";

export const metadata: Metadata = {
  title: "Transactions",
};
const TransactionsPage = () => {
  return (
    <>
      <TransactionsClient />
    </>
  );
};

export default TransactionsPage;
