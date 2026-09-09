import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Điểm hạ cánh của OAuth và của link xác nhận email.
 *
 * Luồng là browser → Google → Supabase → route này. Bên Google Cloud chỉ khai
 * đúng một redirect URI là callback của Supabase; còn URL này phải nằm trong
 * Redirect URLs của Supabase (cả cổng 3000 lẫn 3001).
 */
export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth`);
};
