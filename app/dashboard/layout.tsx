"use client";

import Header from "@/components/dashboard/header";
import Tools from "@/components/dashboard/tools";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import QueryProvider from "@/providers/query-provider";
import SheetProvider from "@/providers/sheet-provider";
import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <FullscreenLoader />;
  }

  if (!isSignedIn) {
    redirect("/");
  }

  return (
    <QueryProvider>
      <SheetProvider />
      <Header />
      <main className="px-3 lg:px-14">
        <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
          {children}
        </div>
      </main>
      <Tools />
    </QueryProvider>
  );
}
