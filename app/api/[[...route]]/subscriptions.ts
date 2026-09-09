import { db } from "@/db/drizze";
import { subscriptions, insertSubscriptionSchema } from "@/db/schema";
import { getUser } from "@/lib/supabase/hono";
import { and, eq, desc } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

const app = new Hono()
  .get("/", async (c) => {
    const user = await getUser(c);
    if (!user) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const data = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .orderBy(desc(subscriptions.createdAt));

    return c.json(data);
  })
  .post(
    "/",
    zValidator(
      "json",
      insertSubscriptionSchema.omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      })
    ),
    async (c) => {
      const user = await getUser(c);
      const values = c.req.valid("json");

      if (!user) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const [data] = await db
        .insert(subscriptions)
        .values({
          id: createId(),
          userId: user.id,
          ...values,
        })
        .returning();

      return c.json(data);
    }
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator(
      "json",
      insertSubscriptionSchema
        .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
        .partial()
    ),
    async (c) => {
      const user = await getUser(c);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!user) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const [data] = await db
        .update(subscriptions)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(
          and(eq(subscriptions.userId, user.id), eq(subscriptions.id, id))
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json(data);
    }
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const user = await getUser(c);
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!user) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const [data] = await db
        .delete(subscriptions)
        .where(
          and(eq(subscriptions.userId, user.id), eq(subscriptions.id, id))
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
