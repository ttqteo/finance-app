import { db } from "@/db/drizze";
import { subscriptions, insertSubscriptionSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { and, eq, desc } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

const app = new Hono()
  .get("/", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const data = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.userId))
      .orderBy(desc(subscriptions.createdAt));

    return c.json(data);
  })
  .post(
    "/",
    clerkMiddleware(),
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
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const [data] = await db
        .insert(subscriptions)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();

      return c.json(data);
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator(
      "json",
      insertSubscriptionSchema
        .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
        .partial()
    ),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const [data] = await db
        .update(subscriptions)
        .set({
          ...values,
          updatedAt: new Date(),
        })
        .where(
          and(eq(subscriptions.userId, auth.userId), eq(subscriptions.id, id))
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
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const [data] = await db
        .delete(subscriptions)
        .where(
          and(eq(subscriptions.userId, auth.userId), eq(subscriptions.id, id))
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
