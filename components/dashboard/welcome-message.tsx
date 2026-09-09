"use client";

import { useUser } from "@/features/auth/hooks/use-user";
import { useTranslations } from "next-intl";
import React from "react";

/**
 * Midday's one editorial moment: the greeting is set in the serif display face
 * at a size nothing else on the page competes with, with the name dropped to
 * muted so the two halves read as one line rather than a shout.
 *
 * The previous version hardcoded `text-white` on a `#89b6fd` subtitle, which
 * was invisible in light mode — it was also rendered by a header component
 * nothing imported, so it never actually appeared.
 */
const WelcomeMessage = () => {
  const t = useTranslations("Common");
  const { firstName, isLoaded } = useUser();

  return (
    <div className="mb-2 space-y-1">
      <h1 className="font-display text-4xl leading-tight tracking-tight lg:text-5xl">
        {t("WelcomeBack.Header")}
        {/* Reserve the name's line even before the session resolves, so the heading
            does not reflow under the reader. */}
        <span className="text-muted-foreground">
          {isLoaded && firstName ? ` ${firstName}` : " "}
        </span>
      </h1>
      <p className="text-sm text-muted-foreground">
        {t("WelcomeBack.Description")}
      </p>
    </div>
  );
};

export default WelcomeMessage;
