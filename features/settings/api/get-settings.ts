import { db } from "@/db/drizze";
import { userSettings } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

/**
 * Chạy trên MỌI request có render trang, vì `i18n/request.ts` gọi nó để chọn
 * ngôn ngữ — kể cả lúc render 404.
 *
 * Trước đây chỗ này phải bọc `try/catch`: `auth()` của Clerk NÉM LỖI khi
 * `clerkMiddleware()` không chạy cho request đó, mà matcher lại cố tình bỏ qua
 * các đường dẫn hình dạng tài nguyên tĩnh. Đường dẫn kiểu `/favicon.png` không
 * có file thật rơi xuống App Router, render 404 qua root layout, đụng phải cú
 * ném đó, và một 404 bình thường bị trả về thành 500.
 *
 * `supabase.auth.getUser()` trả `{ user: null }` chứ không ném, nên cả lớp bug
 * đó biến mất — không còn gì để bọc.
 */
export const getUserSettings = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [data] = user
    ? await db.select().from(userSettings).where(eq(userSettings.userId, user.id))
    : [];

  return data;
};
