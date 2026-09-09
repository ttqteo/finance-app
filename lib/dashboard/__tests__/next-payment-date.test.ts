import { describe, expect, it } from "vitest";
import { nextPaymentDate } from "@/lib/dashboard/next-payment-date";

describe("nextPaymentDate", () => {
  it("cộng tháng cho gói monthly cho tới khi vượt mốc hiện tại", () => {
    const result = nextPaymentDate(
      new Date("2026-01-15"),
      "monthly",
      new Date("2026-03-20")
    );
    expect(result.toISOString().slice(0, 10)).toBe("2026-04-15");
  });

  it("cộng năm cho gói yearly", () => {
    const result = nextPaymentDate(
      new Date("2024-06-10"),
      "yearly",
      new Date("2026-03-20")
    );
    expect(result.toISOString().slice(0, 10)).toBe("2026-06-10");
  });

  it("trả chính startDate khi kỳ đầu còn ở tương lai", () => {
    const result = nextPaymentDate(
      new Date("2026-12-01"),
      "monthly",
      new Date("2026-03-20")
    );
    expect(result.toISOString().slice(0, 10)).toBe("2026-12-01");
  });

  // Chốt hành vi không phân biệt hoa thường. Đây là dòng dữ liệu THẬT, không
  // phải trường hợp giả định.
  //
  // `subscriptions.frequency` là cột `text` tự do và chú thích trong
  // `db/schema.ts` ghi `'monthly', 'yearly'`, nhưng nơi ghi duy nhất — form
  // trong `app/(site)/dashboard/subscriptions/page.tsx` — validate bằng
  // `z.enum(["MONTHLY", "YEARLY"])`, nên mọi dòng trong DB đều VIẾT HOA. Dòng
  // duy nhất đang có đúng là như dưới đây: "YEARLY", bắt đầu 2025-10-14.
  //
  // Nếu so sánh phân biệt hoa thường (`frequency === "yearly"`), hàm không ném
  // lỗi và cũng không trả về giá trị trông sai: nó lặng lẽ rơi vào nhánh
  // monthly, cộng 11 lần và trả "2026-09-14" — một ngày thu phí trông như còn
  // 5 ngày nữa, trong khi kỳ thật còn 35 ngày. Không có chỗ nào khác trên
  // dashboard mâu thuẫn với con số đó, nên sai sót đi thẳng ra màn hình.
  it("coi 'YEARLY' viết hoa là gói năm thay vì rơi về nhánh monthly", () => {
    const result = nextPaymentDate(
      new Date("2025-10-14"),
      "YEARLY",
      new Date("2026-09-09")
    );
    expect(result.toISOString().slice(0, 10)).toBe("2026-10-14");
  });
});
