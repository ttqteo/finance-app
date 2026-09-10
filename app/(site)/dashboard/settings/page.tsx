import { ClientOnly } from "@/components/client-only";
import { FormPageSkeleton } from "@/components/dashboard/skeletons";
import { Metadata } from "next";
import SettingsPage from "@/components/dashboard/settings";

export const metadata: Metadata = {
  title: "Settings",
};

const Page = () => {
  return (
    <>
      {/* Header reads the same settings query and hydrates first, so
          without this the page can hydrate against a warm cache and
          mismatch its server-rendered skeleton. See ClientOnly. */}
      <ClientOnly fallback={<FormPageSkeleton />}>
        <SettingsPage />
      </ClientOnly>
    </>
  );
};

export default Page;
