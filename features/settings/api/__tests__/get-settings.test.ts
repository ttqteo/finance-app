import { getUserSettings } from "@/features/settings/api/get-settings";
import { beforeEach, describe, expect, it, vi } from "vitest";

// `auth()` của Clerk ném lỗi khi `clerkMiddleware()` KHÔNG chạy cho request hiện
// tại. Middleware matcher ở `middleware.ts` cố tình loại trừ các đường dẫn hình
// dạng tài nguyên tĩnh (`.png`, `.svg`, `.js`, ...). Khi không có file nào đứng
// sau đường dẫn đó, Next rơi xuống App Router, render `app/not-found.tsx` bên
// trong `app/layout.tsx`, và layout gọi `getMessages()` → `i18n/request.ts` →
// `getUserSettings()`. Lỗi ném ra ở đây biến một 404 lẽ ra bình thường thành 500.
//
// Đo trên dev server đang chạy trước khi sửa:
//
//   /favicon.png, /favicon.svg, /sw.js, /icons/icon-144x144.png → 500
//   /favicon.ico (app/favicon.ico có thật)                      → 200
//   /admin, /nope-does-not-exist (matcher có khớp)              → 404
//
// Tức lỗi chỉ xảy ra đúng ở giao của hai điều kiện: matcher loại trừ VÀ không có
// file thật. Thêm mấy file favicon còn thiếu chỉ vá được 4 URL cụ thể, nên bản
// sửa nằm ở chỗ khác: coi "không có ngữ cảnh middleware" như "chưa đăng nhập".
const { auth, where } = vi.hoisted(() => ({
  auth: vi.fn(),
  where: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/db/drizze", () => ({
  db: { select: () => ({ from: () => ({ where }) }) },
}));

const clerkMiddlewareMissing = () =>
  new Error(
    "Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()."
  );

describe("getUserSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trả về hàng cấu hình của người dùng đang đăng nhập", async () => {
    const row = { userId: "user_1", language: "vi", currency: "VND" };
    auth.mockResolvedValue({ userId: "user_1" });
    where.mockResolvedValue([row]);

    await expect(getUserSettings()).resolves.toBe(row);
  });

  it("trả về undefined và không truy vấn database khi chưa đăng nhập", async () => {
    auth.mockResolvedValue({ userId: null });

    await expect(getUserSettings()).resolves.toBeUndefined();
    expect(where).not.toHaveBeenCalled();
  });

  it("trả về undefined thay vì ném lỗi khi clerkMiddleware không chạy", async () => {
    auth.mockRejectedValue(clerkMiddlewareMissing());

    await expect(getUserSettings()).resolves.toBeUndefined();
    expect(where).not.toHaveBeenCalled();
  });

  it("vẫn để lỗi truy vấn database nổi lên", async () => {
    auth.mockResolvedValue({ userId: "user_1" });
    where.mockRejectedValue(new Error("connection terminated"));

    await expect(getUserSettings()).rejects.toThrow("connection terminated");
  });
});
