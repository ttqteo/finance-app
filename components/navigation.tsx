"use client";

import { useMedia } from "react-use";
import { MainNav } from "./main-nav";
import MobileNav from "./mobile-nav";
import { UserNav } from "./stocks/user-nav";

export const ROUTES = [
  { href: "/", label: "Market" },
  { href: "/stocks", label: "Stocks" },
  { href: "/transactions", label: "Transactions" },
  { href: "/advanced-chart", label: "Advanced Chart" },
  { href: "/analytics", label: "Analytics" },
  { href: "/portfolio", label: "Portfolio" },
  {
    label: "v1",
    subPath: [
      { href: "/v1/stocks", label: "Stocks" },
      { href: "/v1/news", label: "News" },
      { href: "/v1/blogs", label: "Blog" },
    ],
  },
];

const Navigation = () => {
  const isMobile = useMedia("(max-width: 1024px)", false);

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 fixed z-10 w-full bg-white shadow-sm">
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
