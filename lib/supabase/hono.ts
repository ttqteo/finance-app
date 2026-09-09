import { createServerClient } from "@supabase/ssr";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";

/**
 * Client Supabase dựng riêng cho từng request, mang JWT của chính người gửi
 * request đó. Đây là thứ làm RLS có tác dụng thật: câu truy vấn chạy dưới danh
 * nghĩa user, nên policy trong database mới là nơi quyết định đọc được hàng nào.
 *
 * KHÔNG dùng service-role key ở đây. Service role bỏ qua RLS, và một khi handler
 * chạy bằng nó thì mọi policy chỉ còn là trang trí.
 *
 * `setAll` để trống là cố ý: Next middleware đã refresh token và ghi cookie
 * trước khi request tới được handler, nên ở tầng này chỉ cần đọc.
 */
export const getSupabase = (c: Context) => {
  const cookies = getCookie(c);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () =>
          Object.entries(cookies).map(([name, value]) => ({ name, value })),
        setAll: () => {},
      },
    }
  );
};

/**
 * Trả user hoặc null — không ném lỗi. Handler tự quyết định trả 401.
 *
 * Khác với `getAuth()` của Clerk ở chỗ nó xác thực token với server Supabase
 * chứ không chỉ đọc cookie.
 */
export const getUser = async (c: Context) => {
  const {
    data: { user },
  } = await getSupabase(c).auth.getUser();

  return user;
};
