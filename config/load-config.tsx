"use client";
import { useGetSettings } from "@/features/settings/api/use-get-settings";
import { setCookie } from "@/lib/utils";
import { useEffect } from "react";

const LoadConfigs = () => {
  const { data } = useGetSettings();
  useEffect(() => {
    if (data) {
      setCookie("currency", data.currency, 7);
      setCookie("locale", data.language, 7);
    }
  }, [data]);
  return <></>;
};

export default LoadConfigs;
