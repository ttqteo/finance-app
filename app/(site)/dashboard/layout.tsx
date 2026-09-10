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
    <div className="flex min-h-screen bg-background">
      <QueryProvider>
        <SheetProvider />
        <Sidebar />
        <div className="flex flex-1 flex-col w-full pl-16">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 pt-[4.5rem]">
            {children}
          </main>
        </div>
        <Tools />
      </QueryProvider>
    </div>
  );
}
