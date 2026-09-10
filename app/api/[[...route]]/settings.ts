import { insertUserSettingsSchema } from "@/db/schema";
import { getSupabase, getUser } from "@/lib/supabase/hono";
import { pgTimestampToIso } from "@/lib/pg-date";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

type SettingsRow = {
  user_id: string;
  language: string;
  currency: string;
  timezone: string;
  updated_at: string;
};

/**
 * supabase-js trả về đúng tên cột, còn Drizzle trả về tên thuộc tính camelCase.
 * Ánh xạ lại cho khớp hình dạng cũ — đây chính là thứ giữ cho `AppType` và ~30
 * hook TanStack Query phía client không phải sửa gì.
 */
const toSettings = (row: SettingsRow) => ({
  userId: row.user_id,
  language: row.language,
  currency: row.currency,
  timezone: row.timezone,
  updatedAt: pgTimestampToIso(row.updated_at),
});

const app = new Hono()
  .get("/", async (c) => {
    const user = await getUser(c);

    if (!user) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const supabase = getSupabase(c);

    // Không lọc `user_id` nữa: RLS đã quyết định. Hai nơi cùng quyết định thì
    // có ngày bất đồng với nhau mà không ai biết.
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .maybeSingle();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    if (!data) {
      const { data: created, error: insertError } = await supabase
        .from("user_settings")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (insertError || !created) {
        return c.json(
          { error: insertError?.message ?? "Failed to create settings" },
          500
        );
      }

      return c.json({ data: toSettings(created) });
    }

    return c.json({ data: toSettings(data) });
  })
  .patch(
    "/",
    zValidator(
      "json",
      insertUserSettingsSchema.pick({
        language: true,
        currency: true,
        timezone: true,
      })
    ),
    async (c) => {
      const user = await getUser(c);
      const values = c.req.valid("json");

      if (!user) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const supabase = getSupabase(c);

      const { data, error } = await supabase
        .from("user_settings")
        .update(values)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error || !data) {
        return c.json({ error: error?.message ?? "Not found" }, 404);
      }

      return c.json({ data: toSettings(data) });
    }
  );

export default app;
