"use client";

import NavButton from "@/components/landing/nav-button";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMedia } from "react-use";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const Navigation = () => {
  const t = useTranslations();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const isMobile = useMedia("(max-width: 1024px)", false);

  const routes = [
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
          <Button
            variant={"outline"}
            size="sm"
            className="font-normal border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none transition"
          >
            <MenuIcon className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <nav className="flex flex-col gap-y-2 pt-6">
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
      <NavButton href={"/dashboard"} label={"Login"} isLoginBtn />
    </nav>
  );
};

export default Navigation;
