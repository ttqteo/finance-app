import { insertSubscriptionSchema } from "@/db/schema";
import type { Database } from "@/db/database.types";
import { pgTimestampToIso } from "@/lib/pg-date";
import { getSupabase, getUser } from "@/lib/supabase/hono";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { Hono } from "hono";
import { z } from "zod";

type SubscriptionRow = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: string;
  start_date: string;
  currency: string;
  has_free_trial: boolean | null;
  category_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Hàng từ PostgREST → đúng hình dạng camelCase mà Drizzle vẫn trả về. */
const toSubscription = (row: SubscriptionRow) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  amount: row.amount,
  frequency: row.frequency,
  startDate: pgTimestampToIso(row.start_date),
  currency: row.currency,
  hasFreeTrial: row.has_free_trial,
  categoryId: row.category_id,
  notes: row.notes,
  createdAt: pgTimestampToIso(row.created_at),
  updatedAt: pgTimestampToIso(row.updated_at),
});

type Incoming = Partial<{
  name: string;
  amount: number;
  frequency: string;
  startDate: Date;
  currency: string;
  // Nullable chứ không chỉ boolean: cột cho phép NULL nên zod cũng cho.
  hasFreeTrial: boolean | null;
  categoryId: string | null;
  notes: string | null;
}>;

/**
 * Payload gửi lên → tên cột. `startDate` qua zod là `Date`, mà PostgREST cần
 * chuỗi, nên phải đổi ở đây; Drizzle trước kia tự lo khoản đó.
 *
 * Chỉ đưa vào những khoá thực sự có mặt, để PATCH một phần không vô tình ghi
 * đè cột khác thành undefined.
 */
type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];

const toColumns = (values: Incoming): SubscriptionUpdate => {
  const row: SubscriptionUpdate = {};

  if (values.name !== undefined) row.name = values.name;
  if (values.amount !== undefined) row.amount = values.amount;
  if (values.frequency !== undefined) row.frequency = values.frequency;
  if (values.startDate !== undefined)
    row.start_date = values.startDate.toISOString();
  if (values.currency !== undefined) row.currency = values.currency;
  if (values.hasFreeTrial !== undefined)
    row.has_free_trial = values.hasFreeTrial;
  if (values.categoryId !== undefined) row.category_id = values.categoryId;
  if (values.notes !== undefined) row.notes = values.notes;

  return row;
};

const writableSchema = insertSubscriptionSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

type SubscriptionInsert =
  Database["public"]["Tables"]["subscriptions"]["Insert"];

/**
 * Riêng cho INSERT: `toColumns` trả kiểu Update (mọi khoá tuỳ chọn), còn insert
 * bắt buộc phải có name/amount/frequency/start_date. Zod đã đảm bảo chúng có
 * mặt ở POST nên liệt kê thẳng ra, khỏi ép kiểu.
 */
const toInsertColumns = (
  values: z.infer<typeof writableSchema>,
  userId: string
): SubscriptionInsert => ({
  id: createId(),
  user_id: userId,
  name: values.name,
  amount: values.amount,
  frequency: values.frequency,
  start_date: values.startDate.toISOString(),
  ...toColumns({
    currency: values.currency,
    hasFreeTrial: values.hasFreeTrial,
    categoryId: values.categoryId,
    notes: values.notes,
  }),
});

const app = new Hono()
  .get("/", async (c) => {
    const user = await getUser(c);
    if (!user) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const { data, error } = await getSupabase(c)
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    // Route này trả mảng trần, không bọc trong { data } như các route khác.
    // Giữ nguyên: client đang đọc theo hình dạng đó.
    return c.json(data.map(toSubscription));
  })
  .post("/", zValidator("json", writableSchema), async (c) => {
    const user = await getUser(c);
    const values = c.req.valid("json");

    if (!user) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const { data, error } = await getSupabase(c)
      .from("subscriptions")
      .insert(toInsertColumns(values, user.id))
      .select()
      .single();

    if (error || !data) {
      return c.json({ error: error?.message ?? "Failed to create" }, 500);
    }

    return c.json(toSubscription(data));
  })
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", writableSchema.partial()),
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
        .from("subscriptions")
        .update({
          ...toColumns(values),
          // `$onUpdate` của Drizzle chỉ chạy khi đi qua Drizzle, nên mốc này
          // phải tự đặt.
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json(toSubscription(data));
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
        .from("subscriptions")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      // Riêng route này bọc trong { data } — giữ đúng như trước.
      return c.json({ data: toSubscription(data) });
    }
  );

export default app;
