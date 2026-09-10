import { ClientOnly } from "@/components/client-only";
import { TablePageSkeleton } from "@/components/dashboard/skeletons";
import AccountsPage from "@/components/dashboard/accounts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounts",
};
const Page = () => {
  return (
    <>
      {/* Header's AccountFilter reads the same accounts query and hydrates
          first, so without this the page can hydrate against a warm cache
          and mismatch its server-rendered skeleton. See ClientOnly. */}
      <ClientOnly fallback={<TablePageSkeleton />}>
        <AccountsPage />
      </ClientOnly>
    </>
  );
};

export default Page;
