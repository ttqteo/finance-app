import { getUserSettings } from "@/features/settings/api/get-settings";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const data = await getUserSettings();
  const locale = data?.language || "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
