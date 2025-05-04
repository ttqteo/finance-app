import { db } from "@/db/drizze";
import { categories, subscriptions } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono().get("/", clerkMiddleware(), async (c) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: "Unauthorized!" }, 401);
  }

  // const data = await db
  //   .select({
  //     id: subscriptions.id,
  //     name: subscriptions.name,
  //     amount: subscriptions.amount,
  //     frequency: subscriptions.frequency,
  //     renewalDate: subscriptions.renewalDate,
  //     notes: subscriptions.notes,
  //   })
  //   .from(subscriptions)
  //   .leftJoin(categories, eq(subscriptions.categoryId, categories.id))
  //   .orderBy(desc(subscriptions.updatedAt));

  // return c.json({ data });
  return c.json({ message: "OK" });
});
export default app;
