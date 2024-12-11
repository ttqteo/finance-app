import { Spinner } from "@/components/spinner";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/query-provider";
import SheetProvider from "@/providers/sheet-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance Pro",
  description: "Finace Platform to track your money",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ClerkProviderAny = ClerkProvider as any; // TODO: Remove this later
  const messages = await getMessages();

  return (
    <ClerkProviderAny
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              <SheetProvider />
              <Toaster />
              <Suspense fallback={<Spinner />}>{children}</Suspense>
            </QueryProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProviderAny>
  );
}
