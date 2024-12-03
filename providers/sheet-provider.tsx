"use client";

import NewAccountSheet from "@/features/accounts/components/new-account-sheet";
import { useMountedState } from "react-use";

const SheetProvider = () => {
  const isMounted = useMountedState(); // FIX https://nextjs.org/docs/messages/react-hydration-error

  if (!isMounted) return null;

  return (
    <>
      <NewAccountSheet />
    </>
  );
};

export default SheetProvider;
