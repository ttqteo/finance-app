import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/query-provider";
import SheetProvider from "@/providers/sheet-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Spinner } from "@/components/spinner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance App",
  description: "Track your finance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ClerkProviderAny = ClerkProvider as any;
  return (
    <ClerkProviderAny>
      <html lang="en">
        <body className={inter.className}>
          <QueryProvider>
            <SheetProvider />
            <Toaster />
            <Suspense fallback={<Spinner />}>{children}</Suspense>
          </QueryProvider>
        </body>
      </html>
    </ClerkProviderAny>
  );
}
