"use client";

import { Filters } from "@/components/dashboard/filters";
import { ModeToggle } from "@/components/mode-toggle";
import { Input } from "@/components/ui/input";
import { useGetSettings } from "@/features/settings/api/use-get-settings";
import { setCookie } from "@/lib/utils";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const Header = () => {
  const { data } = useGetSettings();

  useEffect(() => {
    if (data) {
      setCookie("currency", data.currency, 7);
      setCookie("locale", data.language, 7);
    }
  }, [data]);

  const pathname = usePathname();
  const disabled = pathname.includes("settings");

  // Pinned the same way the public nav is, which is the one header in this repo
  // that already stays put. `left-16` clears the fixed sidebar, since going
  // fixed takes this out of the flow and the wrapper's pl-16 no longer applies.
  // `bg-background` is not decoration: without an opaque fill the page scrolls
  // visibly through the bar. z-20 clears the sidebar and Tools button at z-10.
  return (
    <header className="fixed top-0 left-16 right-0 z-20 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 lg:px-6">
      <div className="w-full flex-1">
        <Input type="search" placeholder="Search transactions..." />
      </div>
      <ModeToggle />
      <Filters disabled={disabled} />
    </header>
  );
};

export default Header;
