import { db } from "@/db/drizze";
import { insertUserSettingsSchema, userSettings } from "@/db/schema";
import { getUser } from "@/lib/supabase/hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

const app = new Hono()
  .get("/", async (c) => {
    const user = await getUser(c);

    if (!user) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const [data] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id));

    if (!data) {
      const [newData] = await db
        .insert(userSettings)
        .values({ userId: user.id })
        .returning();
      return c.json({ data: newData });
    }

    return c.json({ data });
  })
  .patch(
    "/",
    zValidator(
      "json",
      insertUserSettingsSchema.pick({
        language: true,
        currency: true,
      })
    ),
    async (c) => {
      const user = await getUser(c);
      const values = c.req.valid("json");

      if (!user) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const [data] = await db
        .update(userSettings)
        .set(values)
        .where(eq(userSettings.userId, user.id))
        .returning();

      return c.json({ data });
    }
  );

export default app;
