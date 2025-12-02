import { db } from "@/db/drizze";
import { userSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

const DAY_IN_MS = 86_400_000;

export const hasPremiumAccess = async (userId: string) => {
  const subscription = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .then((res) => res[0]);

  if (!subscription) return false;

  if (subscription.status === "ACTIVE") return true;

  // Check if within grace period or trial
  const now = new Date();
  if (subscription.endDate && subscription.endDate > now) return true;

  return false;
};

export const checkSubscription = async (userId: string) => {
  const subscription = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .then((res) => res[0]);

  return subscription;
};
