"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useId } from "react";

/**
 * Light/dark, moved here from the dashboard header.
 *
 * Deliberately rendered *outside* <SettingsForm>, not as another field in it:
 *
 * - It applies on click. A theme has to be seen to be judged, so routing it
 *   through the form's Save button would mean choosing blind. And a <button>
 *   inside a <form> defaults to type="submit", so living outside the form is
 *   what guarantees a click here can never save the other fields.
 * - It is not stored with them. Language, currency and timezone live in
 *   `user_settings` and follow the account across devices; the theme stays in
 *   next-themes' localStorage and is per-device. The description says so,
 *   rather than letting its position next to the synced fields imply it syncs.
 *
 * A segmented control rather than a switch because the two states are named
 * choices, not on/off. `aria-pressed` toggle buttons in a group, rather than a
 * radiogroup, because a radiogroup promises arrow-key navigation this does not
 * implement.
 */
export function ThemeSetting() {
  const t = useTranslations("SettingsPage.Theme");
  const { resolvedTheme, setTheme } = useTheme();
  const labelId = useId();
  const descriptionId = useId();

  const options = [
    { value: "light", label: t("Light"), icon: Sun },
    { value: "dark", label: t("Dark"), icon: Moon },
  ] as const;

  return (
    <div className="space-y-2">
      <Label id={labelId}>{t("Label")}</Label>
      {/* p-1 + h-8 = h-10, the height of the SelectTriggers above it. */}
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        className="grid grid-cols-2 gap-1 rounded-md border p-1"
      >
        {options.map(({ value, label, icon: Icon }) => {
          // Undefined until next-themes has read storage; then neither option
          // claims to be active rather than one claiming it wrongly.
          const active = resolvedTheme === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setTheme(value)}
              className={cn(
                "flex h-8 items-center justify-center gap-2 rounded-sm text-sm transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>
      <p id={descriptionId} className="text-sm text-muted-foreground">
        {t("Description")}
      </p>
    </div>
  );
}
