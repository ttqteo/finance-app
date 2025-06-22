"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMedia } from "react-use";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";

type Route = {
  href: string;
  label: string;
  subPath?: { href: string; label: string }[];
};

export const PUBLIC_ROUTES: Route[] = [
  { href: "/", label: "Market" },
  { href: "/stocks", label: "Stocks" },
  { href: "/chart", label: "Chart" },
  { href: "/economic-events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/blogs", label: "Blog" },
];

const Navigation = () => {
  const isMobile = useMedia("(max-width: 1024px)", false);

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 fixed z-10 w-full bg-background border-b">
        {isMobile ? (
          <MobileNav />
        ) : (
          <>
            <MainNav />
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navigation;

const UserNav = () => {
  const { isSignedIn } = useUser();
  return (
    <>
      <ModeToggle />

      <Link href="/dashboard">
        {isSignedIn ? (
          <Button>Go to Dashboard</Button>
        ) : (
          <Button>Sign In</Button>
        )}
      </Link>
    </>
  );
};

type HoverPopoverProps = {
  currentPath: string;
  label: string;
  children: React.ReactNode;
};

const HoverPopover = ({ label, children, currentPath }: HoverPopoverProps) => {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showPopover = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const hidePopover = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={showPopover}
        onMouseLeave={hidePopover}
      >
        <button
          className={cn(
            "flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary px-3 py-1.5",
            currentPath.startsWith("/" + label.toLowerCase())
              ? "text-primary font-bold"
              : "text-muted-foreground"
          )}
        >
          {label}
          {open ? (
            <ChevronUp className="w-4 h-4 transition" />
          ) : (
            <ChevronDown className="w-4 h-4 transition" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-2 space-y-1"
        onMouseEnter={showPopover}
        onMouseLeave={hidePopover}
        align="start"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

const NavItem = ({
  href,
  label,
  currentPath,
}: {
  href: string;
  label: string;
  currentPath: string;
}) => (
  <Link
    href={href}
    className={cn(
      "block pl-3 py-1.5 text-sm rounded-md transition-colors",
      (currentPath === href && href === "/") ||
        (currentPath.startsWith(href) && href !== "/")
        ? "text-primary font-bold"
        : "text-muted-foreground font-medium",
      "hover:text-gray-900 hover:dark:text-gray-100"
    )}
  >
    {label}
  </Link>
);

function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center", className)} {...props}>
      <Logo href="/" className="text-black mr-2" />

      <div className="hidden sm:flex items-center space-x-4">
        {PUBLIC_ROUTES.map((route) =>
          route.subPath ? (
            <HoverPopover
              key={route.label}
              label={route.label}
              currentPath={pathname}
            >
              {route.subPath.map((subRoute) => (
                <NavItem
                  key={subRoute.href}
                  href={subRoute.href}
                  label={subRoute.label}
                  currentPath={pathname}
                />
              ))}
            </HoverPopover>
          ) : (
            <NavItem
              key={route.href}
              href={route.href}
              label={route.label}
              currentPath={pathname}
            />
          )
        )}
      </div>
    </nav>
  );
}

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
          {PUBLIC_ROUTES.map((route) =>
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
