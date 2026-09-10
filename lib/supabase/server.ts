import type { Database } from "@/db/database.types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          // Server Component không ghi được cookie, và Next ném lỗi khi thử.
          // Nuốt lỗi ở đây là đúng chứ không phải giấu bug: middleware mới là
          // chỗ refresh token rồi ghi cookie trở lại, nên session vẫn được gia
          // hạn đều. Route handler thì ghi được, và ở đó try sẽ chạy trót lọt.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
};
