"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * On mobile the page scrolls inside this box, not the document. The header and
 * the bottom bar are fixed, so a document scrollbar ran the full height of the
 * screen, behind both of them. Pinned between the two with `mt-14` (the
 * header's h-14) and a bottom margin of the bar's height (h-16 + its 1px
 * border-t + the safe-area inset), the scrollbar only spans the content.
 *
 * From md up there is no bottom bar and the document scrolls as before.
 *
 * The padding lives on the inner div so the scrollbar sits on the box's edge
 * instead of 16px in from it. It is also why `flex-1` still fills the height on
 * short pages: the inner div is the only flex item, and it will not shrink
 * below its content, so the overflow lands on <main>.
 */
export function DashboardMain({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Next only resets the document's scroll on navigation; a box it does not
  // know about would keep the previous page's offset.
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <main
      ref={ref}
      className="mt-14 mb-[calc(4rem+1px+env(safe-area-inset-bottom))] flex min-h-0 flex-1 flex-col overflow-y-auto md:m-0 md:overflow-visible"
    >
      <div className="flex flex-1 flex-col gap-4 p-4 md:pt-[4.5rem]">
        {children}
      </div>
    </main>
  );
}
