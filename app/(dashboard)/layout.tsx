import Header from "@/components/header";
import React from "react";

type Props = {
  children: React.ReactNode;
};
export default function DashboardLayout({ children }: Props) {
  return (
    // Sidebar version
    // <SidebarProvider>
    //   <AppSidebar />
    //   <main>
    //     <SidebarTrigger />
    //     {children}
    //   </main>
    // </SidebarProvider>
    <>
      <Header />
      <main className="px-3 lg:px-14">{children}</main>
    </>
  );
}
