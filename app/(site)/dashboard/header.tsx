"use client";

import { Filters } from "@/components/dashboard/filters";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserMenu } from "@/features/auth/components/user-menu";
import { useGetSettings } from "@/features/settings/api/use-get-settings";
import { setCookie } from "@/lib/utils";
import { Search, SlidersHorizontal } from "lucide-react";
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
  // that already stays put. `md:left-16` clears the fixed sidebar from md up;
  // below that the sidebar is hidden, so the bar takes the full width. Going
  // fixed drops it out of the flow, which is why the offset lives here rather
  // than coming from the wrapper's padding.
  // `bg-background` is not decoration: without an opaque fill the page scrolls
  // visibly through the bar. z-20 clears the sidebar and Tools button at z-10.
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex h-14 items-center gap-2 border-b bg-background px-4 md:left-16 lg:px-6">
      {/* Mobile has no sidebar, so the logo moves up here to anchor the bar. */}
      <div className="md:hidden">
        <Logo href="/dashboard" />
      </div>

      {/* Hidden on mobile: it takes the whole width there and it does not
          work — no value, no handler, nothing behind it. */}
      <div className="hidden flex-1 md:block">
        <Input type="search" placeholder="Search transactions..." />
      </div>

      <div className="hidden md:block">
        <Filters disabled={disabled} />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <MobileFilters disabled={disabled} />
        {/* The sidebar carries this above md, but it is hidden on mobile and
            it is the only way to sign out. */}
        <div className="md:hidden">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;

/**
 * Three filter controls do not fit a phone's header. Scrolling them sideways
 * was tried first: it truncated all three to "All…", "This…" and "Aug 1" and
 * drew a scrollbar under them. Behind one button in a bottom sheet they get the
 * full width and their real labels.
 */
const MobileFilters = ({ disabled }: { disabled: boolean }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        disabled={disabled}
      >
        <SlidersHorizontal className="size-4" />
        <span className="sr-only">Bộ lọc</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom" className="pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <SheetHeader>
        <SheetTitle>Bộ lọc</SheetTitle>
      </SheetHeader>
      <div className="mt-4">
        <Filters disabled={disabled} />
      </div>
    </SheetContent>
  </Sheet>
);
