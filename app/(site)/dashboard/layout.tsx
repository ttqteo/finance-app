import { BottomNav } from "@/app/(site)/dashboard/bottom-nav";
import { DashboardMain } from "@/app/(site)/dashboard/dashboard-main";
import { Sidebar } from "@/app/(site)/dashboard/sidebar";
import Tools from "@/app/(site)/dashboard/tools";
import QueryProvider from "@/providers/query-provider";
import SheetProvider from "@/providers/sheet-provider";
import Header from "./header";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    // Exactly one screen tall on mobile, so the document never scrolls there
    // and <DashboardMain> does instead. `dvh`, not `vh`: on iOS `100vh` is the
    // viewport with the address bar hidden, which would push the bottom bar
    // off screen.
    <div className="flex h-dvh bg-background md:h-auto md:min-h-screen">
      <QueryProvider>
        <SheetProvider />
        <Sidebar />
        {/* The rail only reserves its 16 of padding from md up, where it
            is actually rendered. */}
        <div className="flex flex-1 flex-col w-full md:pl-16">
          <Header />
          <DashboardMain>{children}</DashboardMain>
        </div>
        <Tools />
        <BottomNav />
      </QueryProvider>
    </div>
  );
}
