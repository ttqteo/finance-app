import { Metadata } from "next";
import AccountsClient from "./client";

export const metadata: Metadata = {
  title: "Accounts",
};
const AccountsPage = () => {
  return (
    <>
      <AccountsClient />
    </>
  );
};

export default AccountsPage;
