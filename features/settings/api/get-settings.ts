import { db } from "@/db/drizze";
import { userSettings } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

// `auth()` ném lỗi khi `clerkMiddleware()` không chạy cho request hiện tại, chứ
// không trả về `userId: null`. Matcher trong `middleware.ts` (bản Clerk khuyến
// nghị) cố tình bỏ qua các đường dẫn hình dạng tài nguyên tĩnh — `.png`, `.svg`,
// `.js`, `.ico`, ... — để middleware khỏi chạy trên mọi file trong `public/`.
//
// Nhưng đường dẫn bị bỏ qua mà KHÔNG có file thật đứng sau thì Next rơi xuống
// App Router: nó render `app/not-found.tsx` bên trong `app/layout.tsx`, và root
// layout gọi `getMessages()` → `i18n/request.ts` → hàm này. Lúc đó không có
// header `x-clerk-auth-status` nên `auth()` ném, và một 404 hoàn toàn bình
// thường bị trả về thành 500. Trình duyệt cùng extension dò `/favicon.png`,
// `/favicon.svg`, `/sw.js`, `/icons/icon-144x144.png` là dính ngay.
//
// Hàm này chỉ đọc ngôn ngữ hiển thị, không chặn gì cả, nên "không có ngữ cảnh
// middleware" xử lý y hệt "chưa đăng nhập" là đúng ngữ nghĩa: cả hai đều không
// có user để tra cứu, và `i18n/request.ts` lùi về locale mặc định. Việc bảo vệ
// route vẫn nằm nguyên ở `auth.protect()` trong middleware.
//
// Bắt lỗi bọc riêng `auth()` chứ không bọc cả câu truy vấn, để lỗi database vẫn
// nổi lên bình thường. Cũng cố ý KHÔNG dò chuỗi thông báo lỗi hay tự đọc header
// `x-clerk-auth-status`: nếu Clerk đổi nội bộ, cách bọc này vẫn chạy đúng (chỉ
// đơn giản là không bao giờ bắt), còn dò header đổi tên sẽ âm thầm coi mọi người
// dùng là khách và nuốt mất cấu hình ngôn ngữ của họ.
const getUserIdOrNull = async () => {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
};

export const getUserSettings = async () => {
  const userId = await getUserIdOrNull();

  const [data] = userId
    ? await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
    : [];
  return data;
};
