import { FullscreenLoader } from "@/components/fullscreen-loader";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter, Roboto } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const roboto = Roboto({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: {
    template: "%s - Finance Pro",
    default: "Finance Pro",
  },
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      afterSignOutUrl="/"
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${roboto.className} font-regular antialiased tracking-wide`}
        >
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider delayDuration={0}>
                <Toaster />
                {children}
              </TooltipProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
