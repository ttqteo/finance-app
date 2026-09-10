import type { Database } from "@/db/database.types";
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

  return createServerClient<Database>(
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
 * Trả `{ id, email }` hoặc null — không ném lỗi, handler tự quyết định trả 401.
 *
 * Dùng `getClaims()` chứ KHÔNG dùng `getUser()`. Cả hai đều xác thực thật,
 * nhưng `getUser()` gọi sang server Supabase mỗi lần, đo được 200–600ms một
 * lượt. Handler nào cũng gọi một lần, cộng thêm một lần nữa ở middleware, nên
 * một lần mở dashboard bắn khoảng chục lượt như thế — vài giây chỉ để hỏi
 * "ai đấy".
 *
 * `getClaims()` xác minh chữ ký ES256 ngay tại chỗ bằng WebCrypto với khoá công
 * khai lấy từ JWKS (chỉ tải một lần rồi cache), nên không tốn lượt mạng nào.
 * Chữ ký giả không qua nổi, và nếu project dùng khoá đối xứng hoặc runtime
 * không có WebCrypto thì thư viện tự lùi về `getUser()`.
 *
 * Đánh đổi: claim được tin cho tới lúc token hết hạn, nên đăng xuất ở nơi khác
 * không có hiệu lực tức thì như `getUser()`. Refresh token bị thu hồi vẫn chặn
 * được ở lần middleware refresh kế tiếp, nên khoảng hở bị chặn trên bởi tuổi
 * của access token.
 */
export const getUser = async (c: Context) => {
  const { data } = await getSupabase(c).auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) return null;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
  };
};
