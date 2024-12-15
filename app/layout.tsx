import { Spinner } from "@/components/spinner";
import { Toaster } from "@/components/ui/sonner";
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
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        elements: {
          footer: "hidden",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <NextIntlClientProvider messages={messages}>
            <Toaster />
            <Suspense fallback={<Spinner />}>{children}</Suspense>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
