import { insertCategoriesSchema } from "@/db/schema";
import { getSupabase, getUser } from "@/lib/supabase/hono";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { Hono } from "hono";
import { z } from "zod";

type CategoryRow = {
  id: string;
  plaid_id: string | null;
  name: string;
  user_id: string;
};

/** Trả lại đúng hình dạng camelCase mà Drizzle vẫn trả, để client khỏi đổi. */
const toCategory = (row: CategoryRow) => ({
  id: row.id,
  plaidId: row.plaid_id,
  name: row.name,
  userId: row.user_id,
});

// Mọi truy vấn dưới đây KHÔNG lọc `user_id`: RLS trong database đã lọc. Giữ
// thêm một bộ lọc ở tầng ứng dụng nghĩa là có hai nơi cùng quyết định quyền
// đọc, và hai nơi đó có ngày lệch nhau mà không ai phát hiện.
const app = new Hono()
  .get("/", async (c) => {
    const user = await getUser(c);
    if (!user) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const { data, error } = await getSupabase(c)
      .from("categories")
      .select("id, name");

    if (error) {
      return c.json({ error: error.message }, 500);
    }

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

      const { data } = await getSupabase(c)
        .from("categories")
        .select("id, name")
        .eq("id", id)
        .maybeSingle();

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

      const { data, error } = await getSupabase(c)
        .from("categories")
        .insert({ id: createId(), user_id: user.id, ...values })
        .select()
        .single();

      if (error || !data) {
        return c.json({ error: error?.message ?? "Failed to create" }, 500);
      }

      return c.json({ data: toCategory(data) });
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

      const { data, error } = await getSupabase(c)
        .from("categories")
        .delete()
        .in("id", values.ids)
        .select("id");

      if (error) {
        return c.json({ error: error.message }, 500);
      }

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

      const { data } = await getSupabase(c)
        .from("categories")
        .update(values)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (!data) {
        return c.json({ error: "Not found" }, 400);
      }

      return c.json({ data: toCategory(data) });
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

      const { data } = await getSupabase(c)
        .from("categories")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (!data) {
        return c.json({ error: "Not found" }, 400);
      }

      return c.json({ data });
    }
  );

export default app;
