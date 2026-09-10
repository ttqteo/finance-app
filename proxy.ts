import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = [/^\/dashboard(\/.*)?$/, /^\/api(\/.*)?$/];

// Next 16 renamed middleware to proxy: same job, same `config.matcher`, but it
// now runs on the Node.js runtime instead of the Edge one.
export default async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const path = request.nextUrl.pathname;

  if (!user && PROTECTED.some((re) => re.test(path))) {
    // API trả 401 chứ không redirect: react-query cần một lỗi để hiện, chứ
    // nuốt nguyên trang HTML sign-in rồi báo "Failed to fetch" thì vô nghĩa.
    if (path.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirect_url", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

// Giữ nguyên matcher Clerk để lại: nó loại trừ các đường dẫn hình dạng tài
// nguyên tĩnh cho proxy khỏi chạy trên mọi file trong public/.
//
// Hệ quả: đường dẫn dạng tài nguyên mà KHÔNG có file thật (/favicon.png,
// /sw.js...) rơi xuống App Router và render 404 qua root layout mà không có
// session. Chuyện đó giờ vô hại vì `supabase.auth.getUser()` trả null thay vì
// ném lỗi — trước đây `auth()` của Clerk ném và biến 404 thành 500.
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
