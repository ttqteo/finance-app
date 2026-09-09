import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh access token của Supabase rồi ghi cookie mới vào response.
 *
 * Đây là nơi DUY NHẤT gia hạn session, nên middleware phải chạy trước mọi
 * request render trang hay gọi API — xem matcher trong `middleware.ts`.
 */
export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Phải là getUser() chứ không phải getSession(): getUser() hỏi server Supabase
  // để xác thực token, còn getSession() chỉ đọc cookie nên tin cả token bịa.
  //
  // getUser() KHÔNG ném lỗi khi không có session — nó trả { user: null }. Đó là
  // khác biệt với `auth()` của Clerk và là lý do lớp bug "404 thành 500" biến mất.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
};
