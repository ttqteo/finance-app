"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "./logo";
import { ROUTES } from "./navigation";

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
      "block px-3 py-1.5 text-sm rounded-md transition-colors",
      (currentPath === href && href === "/") ||
        (currentPath.startsWith(href) && href !== "/")
        ? "text-primary font-bold"
        : "text-muted-foreground font-medium",
      "hover:text-primary hover:text-blue-800"
    )}
  >
    {label}
  </Link>
);

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center", className)} {...props}>
      <Logo href="/" className="text-black mr-2" />

      <div className="hidden sm:flex items-center space-x-4">
        {ROUTES.map((route) =>
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
