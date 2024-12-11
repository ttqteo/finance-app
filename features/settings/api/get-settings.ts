import { db } from "@/db/drizze";
import { userSettings } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const getUserSettings = async () => {
  const { userId } = await auth();

  const [data] = userId
    ? await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
    : [];
  return data;
};
