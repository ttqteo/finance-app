"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Logo } from "../logo";
import { Badge } from "../ui/badge";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Logo href="/" className="text-black" />
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Market
      </Link>
      <Link
        href="/stocks"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/stocks" || pathname.startsWith("/stocks/")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Stocks
      </Link>
      <Link
        href="/transactions"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/transactions" || pathname.startsWith("/transactions/")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Transactions
      </Link>
      <Link
        href="/advanced-chart"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/advanced-chart"
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Advanced Chart
      </Link>
      <Link
        href="/analytics"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/analytics" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Analytics
      </Link>
      <Link
        href="/portfolio"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/portfolio" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Portfolio
      </Link>
      <Link
        href="/v1/stocks"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/v1/stocks")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Stocks <Badge variant="secondary">v1</Badge>
      </Link>
      <Link
        href="/v1/news"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/v1/news")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        News <Badge variant="secondary">v1</Badge>
      </Link>
      <Link
        href="/v1/blogs"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/v1/blogs")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Blog <Badge variant="secondary">v1</Badge>
      </Link>
    </nav>
  );
}
