"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { ROUTES } from "./navigation";
import { UserNav } from "./stocks/user-nav";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

const MobileNav = () => {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const onClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <Button
          variant={"outline"}
          size="lg"
          className="font-normal border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none transition h-[64px]"
        >
          <MenuIcon className="size-12" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col justify-between">
        <nav className="flex flex-col gap-y-2 pt-8 z-20">
          {ROUTES.map((route) =>
            route.subPath ? (
              <div key={route.label}>
                <Separator />
                {route.subPath.map((subRoute) => (
                  <Button
                    key={subRoute.href}
                    variant={subRoute.href === pathname ? "secondary" : "ghost"}
                    onClick={() => onClick(subRoute.href)}
                    className="justify-start"
                  >
                    {subRoute.label}{" "}
                    <Badge variant="secondary">{route.label}</Badge>
                  </Button>
                ))}
              </div>
            ) : (
              <Button
                key={route.label}
                variant={route.href === pathname ? "secondary" : "ghost"}
                onClick={() => onClick(route.href)}
                className="justify-start"
              >
                {route.label}
              </Button>
            )
          )}
        </nav>
        <UserNav />
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
