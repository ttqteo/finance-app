"use client";

import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import React from "react";

const WelcomeMessage = () => {
  const t = useTranslations("Common");
  const { user, isLoaded } = useUser();
  return (
    <div className="space-y-2 mb-4">
      <h2 className="text-2xl lg:text-4xl text-white font-medium">
        {t("WelcomeBack.Header")}
        {isLoaded ? ", " : " "}
        {user?.firstName}
      </h2>
      <p className="text-sm lg:text-base text-[#89b6fd]">
        {t("WelcomeBack.Description")}
      </p>
    </div>
  );
};

export default WelcomeMessage;
