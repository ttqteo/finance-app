import { createClient } from "@/lib/supabase/server";

/**
 * Chạy trên MỌI request có render trang, vì `i18n/request.ts` gọi nó để chọn
 * ngôn ngữ — kể cả lúc render 404. Nên nó phải rẻ, và phải không bao giờ ném.
 *
 * Rẻ: `getClaims()` xác minh chữ ký JWT tại chỗ bằng JWKS đã cache, thay vì
 * `getUser()` vốn hỏi server Supabase mất 200–600ms mỗi lần dựng trang.
 *
 * Không ném: trước đây chỗ này phải bọc `try/catch` vì `auth()` của Clerk NÉM
 * LỖI khi middleware không chạy, mà matcher lại cố tình bỏ qua các đường dẫn
 * hình dạng tài nguyên tĩnh. `/favicon.png` không có file thật rơi xuống App
 * Router, render 404 qua root layout, đụng cú ném đó, và một 404 bình thường
 * bị trả thành 500. API của Supabase trả null nên hết cả lớp bug.
 *
 * Chỉ lấy đúng hai cột cần dùng. Không lọc `user_id`: RLS đã lọc.
 */
export const getUserSettings = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) return undefined;

  const { data: settings } = await supabase
    .from("user_settings")
    .select("language, currency")
    .maybeSingle();

  return settings ?? undefined;
};
