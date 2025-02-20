"use client";

import NavButton from "@/components/landing/nav-button";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMedia } from "react-use";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "../spinner";

const Navigation = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const isMobile = useMedia("(max-width: 1024px)", false);

  const routes = [
    {
      href: "/stock",
      label: t("Landing.StockPage.Header"),
    },
    {
      href: "/",
      label: t("Landing.DocsPage.Header"),
    },
    {
      href: "/",
      label: t("Landing.PricingPage.Header"),
    },
    {
      href: "/",
      label: t("Landing.ContactPage.Header"),
    },
  ];

  const onClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger>
          {!isLoaded ? (
            <Spinner size={"small"} />
          ) : (
            <Button
              variant={"outline"}
              size="lg"
              className="font-normal border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none transition"
            >
              <MenuIcon className="size-6" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent>
          <nav className="flex flex-col gap-y-2 pt-8 z-20">
            {routes.map((route) => (
              <Button
                key={route.label}
                variant={route.href === pathname ? "secondary" : "ghost"}
                onClick={() => onClick(route.href)}
                className="justify-start"
                disabled
              >
                {route.label}
              </Button>
            ))}
            {isSignedIn ? (
              <Button
                onClick={() => onClick("/dashboard")}
                className="justify-start"
              >
                {t("Landing.GoToDashboard")}
              </Button>
            ) : (
              <Button
                onClick={() => onClick("/dashboard")}
                className="justify-start"
              >
                {t("Landing.SignIn")}
              </Button>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
      {routes.map((route) => (
        <NavButton key={route.label} href={route.href} label={route.label} />
      ))}
      {isSignedIn ? (
        <NavButton
          href={"/dashboard"}
          label={t("Landing.GoToDashboard")}
          isLoginBtn
        />
      ) : (
        <NavButton href={"/dashboard"} label={t("Landing.SignIn")} isLoginBtn />
      )}
    </nav>
  );
};

export default Navigation;
