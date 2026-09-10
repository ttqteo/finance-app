import { db } from "@/db/drizze";
import { userSettings } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

/**
 * Chạy trên MỌI request có render trang, vì `i18n/request.ts` gọi nó để chọn
 * ngôn ngữ — kể cả lúc render 404. Chính vì thế nó phải rẻ, và phải không bao
 * giờ ném lỗi.
 *
 * Rẻ: `getClaims()` xác minh chữ ký JWT tại chỗ bằng JWKS đã cache, thay vì
 * `getUser()` vốn hỏi server Supabase mất 200–600ms mỗi lần dựng trang.
 *
 * Không ném: trước đây chỗ này phải bọc `try/catch` vì `auth()` của Clerk NÉM
 * LỖI khi `clerkMiddleware()` không chạy, mà matcher lại cố tình bỏ qua các
 * đường dẫn hình dạng tài nguyên tĩnh. `/favicon.png` không có file thật rơi
 * xuống App Router, render 404 qua root layout, đụng cú ném đó, và một 404
 * bình thường bị trả thành 500. API của Supabase trả null nên hết cả lớp bug.
 */
export const getUserSettings = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  const [rows] = userId
    ? await db.select().from(userSettings).where(eq(userSettings.userId, userId))
    : [];

  return rows;
};
