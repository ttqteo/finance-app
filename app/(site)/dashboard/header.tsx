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

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b px-4 lg:px-6">
      <div className="w-full flex-1">
        <Input type="search" placeholder="Search transactions..." />
      </div>
      <ModeToggle />
      <Filters disabled={disabled} />
    </header>
  );
};

export default Header;
