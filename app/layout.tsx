import { Spinner } from "@/components/spinner";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider, GoogleOneTap } from "@clerk/nextjs";
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
  icons: {
    icon: [
      {
        url: "/logo.png",
        href: "/logo.png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
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
            <Toaster />
            <GoogleOneTap />
            <Suspense fallback={<Spinner />}>{children}</Suspense>
          </ClerkProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
