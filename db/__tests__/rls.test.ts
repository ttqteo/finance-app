import type { Database } from "@/db/database.types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Bài test tự động DUY NHẤT của đợt migrate, và nó xứng đáng: policy RLS hỏng
 * thì hỏng LẶNG LẼ — trả về ít hàng hơn chứ không báo lỗi. Không có gì khác
 * bắt được kiểu thất bại đó.
 *
 * Cần một Supabase thật cùng hai tài khoản test. Thiếu biến môi trường thì bỏ
 * qua, để `pnpm test` trên máy chưa cấu hình vẫn xanh — nhưng bỏ qua KHÔNG
 * phải là đạt: xem dòng in ra ở cuối.
 *
 * Đặt trong `.env.test.local` (đừng commit):
 *
 *   RLS_TEST_USER_A_EMAIL / RLS_TEST_USER_A_PASSWORD
 *   RLS_TEST_USER_B_EMAIL / RLS_TEST_USER_B_PASSWORD
 *
 * Hai tài khoản này tạo tay trên dashboard Supabase, nhớ xác nhận email.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const aEmail = process.env.RLS_TEST_USER_A_EMAIL;
const aPassword = process.env.RLS_TEST_USER_A_PASSWORD;
const bEmail = process.env.RLS_TEST_USER_B_EMAIL;
const bPassword = process.env.RLS_TEST_USER_B_PASSWORD;

const configured = Boolean(
  url && key && aEmail && aPassword && bEmail && bPassword
);

if (!configured) {
  console.warn(
    "[rls.test] BỎ QUA — thiếu biến môi trường. Policy RLS đang KHÔNG được " +
      "kiểm chứng tự động. Xem chú thích đầu file để bật."
  );
}

const maybe = configured ? describe : describe.skip;

const signIn = async (email: string, password: string) => {
  const client = createClient<Database>(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`không đăng nhập được ${email}: ${error.message}`);

  return client;
};

maybe("RLS", () => {
  let a: SupabaseClient<Database>;
  let b: SupabaseClient<Database>;
  let aUserId: string;
  let bUserId: string;
  let accountIdOfA: string;

  beforeAll(async () => {
    a = await signIn(aEmail!, aPassword!);
    b = await signIn(bEmail!, bPassword!);

    aUserId = (await a.auth.getUser()).data.user!.id;
    bUserId = (await b.auth.getUser()).data.user!.id;

    accountIdOfA = `rls_test_${Date.now()}`;
    const { error } = await a
      .from("accounts")
      .insert({ id: accountIdOfA, name: "RLS fixture", user_id: aUserId });

    if (error) throw new Error(`không tạo được account của A: ${error.message}`);
  }, 30_000);

  it("A đọc được account của chính mình", async () => {
    const { data } = await a.from("accounts").select("id");
    expect(data?.map((r) => r.id)).toContain(accountIdOfA);
  });

  it("B KHÔNG đọc được account của A", async () => {
    const { data } = await b.from("accounts").select("id");
    expect(data?.map((r) => r.id) ?? []).not.toContain(accountIdOfA);
  });

  it("B không lấy được account của A kể cả khi biết id", async () => {
    const { data } = await b
      .from("accounts")
      .select("id")
      .eq("id", accountIdOfA);

    // Quan trọng: RLS trả về RỖNG chứ không báo lỗi. Đây đúng là kiểu thất bại
    // lặng lẽ mà bài test này sinh ra để bắt.
    expect(data).toEqual([]);
  });

  it("B không ghi được hàng gắn user_id của A", async () => {
    const { error } = await b.from("accounts").insert({
      id: `rls_forge_${Date.now()}`,
      name: "forged",
      user_id: aUserId,
    });

    // Chỗ này là lý do policy phải có `with check`: chỉ có `using` thì câu
    // insert này lọt.
    expect(error).not.toBeNull();
  });

  it("B không sửa được account của A", async () => {
    const { data } = await b
      .from("accounts")
      .update({ name: "hijacked" })
      .eq("id", accountIdOfA)
      .select();

    expect(data ?? []).toEqual([]);

    const { data: still } = await a
      .from("accounts")
      .select("name")
      .eq("id", accountIdOfA)
      .single();

    expect(still?.name).toBe("RLS fixture");
  });

  it("B không xoá được account của A", async () => {
    await b.from("accounts").delete().eq("id", accountIdOfA);

    const { data } = await a
      .from("accounts")
      .select("id")
      .eq("id", accountIdOfA);

    expect(data?.map((r) => r.id)).toContain(accountIdOfA);
  });

  it("khách chưa đăng nhập không đọc được gì", async () => {
    const anon = createClient<Database>(url!, key!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data } = await anon.from("accounts").select("id");
    expect(data ?? []).toEqual([]);
  });

  it("hai user thật sự khác nhau", () => {
    expect(aUserId).not.toBe(bUserId);
  });
});
