import { Metadata } from "next";
import SettingsPage from "@/components/dashboard/settings";

export const metadata: Metadata = {
  title: "Settings",
};

const Page = () => {
  return (
    <>
      <SettingsPage />
    </>
  );
};

export default Page;
