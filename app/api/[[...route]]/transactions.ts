import type { Database } from "@/db/database.types";
import { insertTransactionSchema } from "@/db/schema";
import { pgTimestampToIso } from "@/lib/pg-date";
import { getSupabase, getUser } from "@/lib/supabase/hono";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { parse, subDays } from "date-fns";
import { Hono } from "hono";
import { z } from "zod";

type TransactionRow = {
  id: string;
  amount: number;
  payee: string;
  notes: string | null;
  date: string;
  account_id: string;
  user_id: string;
  category__id: string | null;
};

type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];

/** Hàng đầy đủ → hình dạng camelCase mà Drizzle vẫn trả về. */
const toTransaction = (row: TransactionRow) => ({
  id: row.id,
  amount: row.amount,
  payee: row.payee,
  notes: row.notes,
  date: pgTimestampToIso(row.date),
  accountId: row.account_id,
  userId: row.user_id,
  categoryId: row.category__id,
});

type Incoming = {
  amount: number;
  payee: string;
  notes?: string | null;
  date: Date;
  accountId: string;
  categoryId?: string | null;
};

const toColumns = (values: Incoming): TransactionUpdate => ({
  amount: values.amount,
  payee: values.payee,
  notes: values.notes ?? null,
  // zod cho ra `Date`, PostgREST cần chuỗi — Drizzle trước kia tự lo.
  date: values.date.toISOString(),
  account_id: values.accountId,
  category__id: values.categoryId ?? null,
});

const writableSchema = insertTransactionSchema.omit({
  id: true,
  userId: true,
});

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const user = await getUser(c);
      const { from, to, accountId } = c.req.valid("query");

      if (!user) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;
      const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

      const supabase = getSupabase(c);

      let query = supabase
        .from("transactions")
        .select("id, date, category__id, payee, amount, notes, account_id")
        .gte("date", startDate.toISOString())
        .lte("date", endDate.toISOString())
        .order("date", { ascending: false });

      if (accountId) {
        query = query.eq("account_id", accountId);
      }

      // Tên account và category lấy bằng hai truy vấn riêng rồi ghép ở TS, chứ
      // không dùng embed của PostgREST. Lý do: `transactions` giờ trỏ sang
      // `accounts` bằng composite FK (account_id, user_id), mà embed dựa vào
      // việc PostgREST tự dò quan hệ — chỗ đó dễ hụt và không kiểm chứng được
      // nếu không chạy thật. Hai bảng này nhỏ và RLS đã giới hạn theo user.
      const [txResult, accountsResult, categoriesResult] = await Promise.all([
        query,
        supabase.from("accounts").select("id, name"),
        supabase.from("categories").select("id, name"),
      ]);

      if (txResult.error) {
        return c.json({ error: txResult.error.message }, 500);
      }

      const accountNames = new Map(
        (accountsResult.data ?? []).map((a) => [a.id, a.name])
      );
      const categoryNames = new Map(
        (categoriesResult.data ?? []).map((cat) => [cat.id, cat.name])
      );

      // `flatMap` thay cho `map` để giữ đúng ngữ nghĩa INNER JOIN cũ: hàng nào
      // không tìm được account thì bị loại, và nhờ vậy `account` vẫn là
      // `string` chứ không thành `string | null` như phía client đang mong đợi.
      // Trên thực tế nhánh loại này không bao giờ chạy — composite FK bắt buộc
      // account phải tồn tại và cùng chủ, mà RLS thì trả về đủ account của họ.
      const data = txResult.data.flatMap((row) => {
        const account = accountNames.get(row.account_id);
        if (account === undefined) return [];

        return [
          {
            id: row.id,
            date: pgTimestampToIso(row.date),
            // LEFT JOIN cũ: chi tiêu chưa phân loại vẫn phải xuất hiện,
            // với name null, để client tự đặt nhãn.
            category: row.category__id
              ? categoryNames.get(row.category__id) ?? null
              : null,
            categoryId: row.category__id,
            payee: row.payee,
            amount: row.amount,
            notes: row.notes,
            accountId: row.account_id,
            account,
          },
        ];
      });

      return c.json({ data });
    }
  )
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
        .from("transactions")
        .select("id, date, category__id, payee, amount, notes, account_id")
        .eq("id", id)
        .maybeSingle();

      if (!data) {
        return c.json({ error: "Not found" }, 400);
      }

      return c.json({
        data: {
          id: data.id,
          date: pgTimestampToIso(data.date),
          categoryId: data.category__id,
          payee: data.payee,
          amount: data.amount,
          notes: data.notes,
          accountId: data.account_id,
        },
      });
    }
  )
  .post("/", zValidator("json", writableSchema), async (c) => {
    const user = await getUser(c);
    const values = c.req.valid("json");

    if (!user) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const row: TransactionInsert = {
      ...(toColumns(values) as TransactionInsert),
      id: createId(),
      user_id: user.id,
    };

    const { data, error } = await getSupabase(c)
      .from("transactions")
      .insert(row)
      .select()
      .single();

    if (error || !data) {
      return c.json({ error: error?.message ?? "Failed to create" }, 500);
    }

    return c.json({ data: toTransaction(data) });
  })
  .post(
    "/bulk-create",
    zValidator("json", z.array(writableSchema)),
    async (c) => {
      const user = await getUser(c);
      const values = c.req.valid("json");

      if (!user) {
        return c.json({ error: "Unauthorized!" }, 401);
      }

      const rows: TransactionInsert[] = values.map((value) => ({
        ...(toColumns(value) as TransactionInsert),
        id: createId(),
        user_id: user.id,
      }));

      const { data, error } = await getSupabase(c)
        .from("transactions")
        .insert(rows)
        .select();

      if (error) {
        return c.json({ error: error.message }, 500);
      }

      return c.json({ data: data.map(toTransaction) });
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

      // Bản Drizzle phải dựng CTE lọc qua join sang `accounts` để chỉ xoá hàng
      // của chính user. Giờ `transactions` có `user_id` và RLS lo việc đó, nên
      // câu lệnh gọn lại đúng một dòng.
      const { data, error } = await getSupabase(c)
        .from("transactions")
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
    zValidator("json", writableSchema),
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
        .from("transactions")
        .update(toColumns(values))
        .eq("id", id)
        .select()
        .maybeSingle();

      if (!data) {
        return c.json({ error: "Not found" }, 400);
      }

      return c.json({ data: toTransaction(data) });
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
        .from("transactions")
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
