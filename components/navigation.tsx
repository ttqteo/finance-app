"use client";

import { useMedia } from "react-use";
import { MainNav } from "./main-nav";
import MobileNav from "./mobile-nav";
import { UserNav } from "./homepage/user-nav";

type Route = {
  href: string;
  label: string;
  subPath?: { href: string; label: string }[];
};

export const PUBLIC_ROUTES: Route[] = [
  { href: "/", label: "Market" },
  { href: "/stocks", label: "Stocks" },
  { href: "/chart", label: "Chart" },
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
