"use client";

import { Filters } from "@/components/dashboard/filters";
import Navigation from "@/components/dashboard/navigation";
import { Logo } from "@/components/logo";
import WelcomeMessage from "@/components/dashboard/welcome-message";
import { useGetSettings } from "@/features/settings/api/use-get-settings";
import { setCookie } from "@/lib/utils";
import { UserMenu } from "@/features/auth/components/user-menu";
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
    <header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 lg:px-14 pb-36">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-6">
            <Logo href="/" className="hidden sm:block" />
            <Navigation />
          </div>
          <UserMenu />
        </div>
        <WelcomeMessage />
        <Filters disabled={disabled} />
      </div>
    </header>
  );
};

export default Header;
