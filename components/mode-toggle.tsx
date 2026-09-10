"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";

/**
 * A binary choice does not need a menu: one click flips light/dark. The
 * "System" option is gone along with the dropdown, so `enableSystem` is off in
 * the provider too — otherwise a stored "system" value would still be
 * reachable and this button could not represent it.
 *
 * `resolvedTheme` rather than `theme` so the first click is correct even for a
 * user whose stored value predates this change.
 */
export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Both icons render; CSS decides which is visible, so there is nothing
          to mismatch during hydration. */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
