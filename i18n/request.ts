import { db } from "@/db/drizze";
import { userSettings } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const { userId } = await auth();
  let locale = "en";
  if (userId) {
    const [data] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    if (data.language) {
      locale = data.language;
    }
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
