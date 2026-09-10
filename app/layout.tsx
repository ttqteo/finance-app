import { FullscreenLoader } from "@/components/fullscreen-loader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Instrument_Serif, Roboto } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], weight: "400" });
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${roboto.className} ${display.variable} font-regular antialiased tracking-wide`}
      >
        <Suspense fallback={<FullscreenLoader />}>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              disableTransitionOnChange
            >
              <TooltipProvider delayDuration={0}>
                <Toaster />
                {children}
              </TooltipProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </Suspense>
      </body>
    </html>
  );
}
