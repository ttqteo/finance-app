import { db } from "@/db/drizze";
import { insertUserSettingsSchema, userSettings } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const [data] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, auth.userId));

    if (!data) {
      const [newData] = await db
        .insert(userSettings)
        .values({ userId: auth.userId })
        .returning();
      return c.json({ data: newData });
    }

    return c.json({ data });
  })
  .patch(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertUserSettingsSchema.pick({
        language: true,
        currency: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const [data] = await db
        .update(userSettings)
        .set(values)
        .where(eq(userSettings.userId, auth.userId))
        .returning();

      return c.json({ data });
    }
  );

export default app;
