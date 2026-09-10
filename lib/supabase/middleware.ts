import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh access token của Supabase rồi ghi cookie mới vào response.
 *
 * Đây là nơi DUY NHẤT gia hạn session, nên proxy phải chạy trước mọi
 * request render trang hay gọi API — xem matcher trong `proxy.ts`.
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

  // `getClaims()` chứ không phải `getSession()` trần: getSession chỉ đọc cookie
  // nên tin cả token bịa, còn getClaims xác minh chữ ký ES256 tại chỗ bằng
  // WebCrypto với JWKS đã cache — an toàn tương đương `getUser()` mà không tốn
  // một lượt mạng 200–600ms trên MỌI request.
  //
  // Việc gia hạn token vẫn chạy: getClaims gọi getSession bên trong, và chính
  // getSession mới là chỗ refresh khi token hết hạn rồi ghi cookie mới qua
  // `setAll` ở trên.
  const { data } = await supabase.auth.getClaims();

  return { response, user: data?.claims ?? null };
};
