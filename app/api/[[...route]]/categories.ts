import { db } from "@/db/drizze";
import { categories, insertCategoriesSchema } from "@/db/schema";
import { getUser } from "@/lib/supabase/hono";
import { and, eq, inArray } from "drizzle-orm";
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
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.userId, user.id));

    return c.json({ data });
  })
  .get(
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
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(and(eq(categories.userId, user.id), eq(categories.id, id)));

      if (!data) {
        return c.json({ error: "Not found" }, 400);
      }
      return c.json({ data });
    }
  )
  .post(
    "/",
    zValidator("json", insertCategoriesSchema.pick({ name: true })),
    async (c) => {
      const user = await getUser(c);
      const values = c.req.valid("json");

      if (!user) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const [data] = await db
        .insert(categories)
        .values({
          id: createId(),
          userId: user.id,
          ...values,
        })
        .returning();
      return c.json({ data });
    }
  )
  .post(
    "/bulk-delete",
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const user = await getUser(c);
      const values = c.req.valid("json");

      if (!user) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const data = await db
        .delete(categories)
        .where(
          and(
            eq(categories.userId, user.id),
            inArray(categories.id, values.ids)
          )
        )
        .returning({
          id: categories.id,
        });
      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertCategoriesSchema.pick({ name: true })),
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
        .update(categories)
        .set(values)
        .where(and(eq(categories.userId, user.id), eq(categories.id, id)))
        .returning();
      if (!data) {
        return c.json({ error: "Not found" }, 400);
      }
      return c.json({ data });
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
        .delete(categories)
        .where(and(eq(categories.userId, user.id), eq(categories.id, id)))
        .returning({ id: categories.id });
      if (!data) {
        return c.json({ error: "Not found" }, 400);
      }
      return c.json({ data });
    }
  );

export default app;
