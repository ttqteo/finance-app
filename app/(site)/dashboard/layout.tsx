import { Sidebar } from "@/app/(site)/dashboard/sidebar";
import Tools from "@/components/dashboard/tools";
import QueryProvider from "@/providers/query-provider";
import SheetProvider from "@/providers/sheet-provider";
import Header from "./header";

type Props = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      <QueryProvider>
        <SheetProvider />
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main
            className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8"
            style={{ maxWidth: "calc(100vw - 64px)" }}
          >
            {children}
          </main>
        </div>
        <Tools />
      </QueryProvider>
    </div>
  );
}
