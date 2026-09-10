import { describe, expect, it } from "vitest";
import { nextPaymentDate } from "@/lib/dashboard/next-payment-date";

// Mọi `startDate` dưới đây mang 12:00Z chứ không phải chuỗi chỉ có ngày.
//
// `next-payment-date.ts` đã cảnh báo đúng chuyện này nhưng chính file test lại
// chưa áp dụng. `new Date("2026-01-15")` là nửa đêm UTC, không có khoảng đệm
// lùi. Hàm bước theo GIỜ ĐỊA PHƯƠNG (cố ý — xem chú thích ở đó), nên tại vùng
// có offset LỚN HƠN ở kết quả so với lúc bắt đầu, tức mùa xuân đổi giờ bán cầu
// bắc, giờ treo tường được giữ nguyên nên thời điểm lùi một tiếng, vượt ngược
// qua nửa đêm UTC, và `toISOString()` đọc ra sớm một ngày.
//
// Đã đo bằng cách chạy cả suite qua PowerShell với `TZ`:
//
//   UTC, Asia/Saigon, Australia/Sydney,
//   Pacific/Kiritimati, Pacific/Midway      → 14 passed
//   Europe/London, America/New_York,
//   America/Los_Angeles                     →  1 failed | 13 passed
//     ("giữ nguyên ngày 31…" bên dưới vốn đã có 12:00Z nên không nằm trong số đó)
//
// Không phải cứ ở phía tây UTC là hỏng: Midway (UTC-11) xanh vì không đổi giờ,
// Sydney lùi giờ trong cùng khoảng nên cũng xanh. Đúng như file nguồn dự đoán.
// Dời fixture ra giữa ngày làm cả tám vùng xanh mà KHÔNG đổi giá trị kỳ vọng
// nào — 12:00Z cách mốc nửa đêm UTC 12 tiếng, thừa sức chịu một tiếng lệch.
//
// Chỉ `startDate` cần đệm vì nó là toán hạng bị `addMonths`/`addYears` bước
// qua. `now` chỉ đem đi so sánh nên giữ nguyên nửa đêm UTC.
//
// Dữ liệu thật không dính lỗi này: date picker lưu nửa đêm GIỜ ĐỊA PHƯƠNG.
describe("nextPaymentDate", () => {
  it("cộng tháng cho gói monthly cho tới khi vượt mốc hiện tại", () => {
    const result = nextPaymentDate(
      new Date("2026-01-15T12:00:00Z"),
      "monthly",
      new Date("2026-03-20")
    );
    expect(result.toISOString().slice(0, 10)).toBe("2026-04-15");
  });

  it("cộng năm cho gói yearly", () => {
    const result = nextPaymentDate(
      new Date("2024-06-10T12:00:00Z"),
      "yearly",
      new Date("2026-03-20")
    );
    expect(result.toISOString().slice(0, 10)).toBe("2026-06-10");
  });

  it("trả chính startDate khi kỳ đầu còn ở tương lai", () => {
    const result = nextPaymentDate(
      new Date("2026-12-01T12:00:00Z"),
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
      new Date("2025-10-14T12:00:00Z"),
      "YEARLY",
      new Date("2026-09-09")
    );
    expect(result.toISOString().slice(0, 10)).toBe("2026-10-14");
  });

  // Chốt cách tính theo SỐ KỲ, không cộng dồn từ kết quả trước.
  //
  // `addMonths` kẹp tháng ngắn: 2026-01-31 cộng một tháng ra 2026-02-28. Nếu
  // lặp và cộng tiếp từ KẾT QUẢ TRƯỚC thì ngày 28 bị mang theo mãi — bốn bước
  // cho ra 2026-05-28, tức mọi gói bắt đầu ngày 29-31 sẽ vĩnh viễn hiện sai
  // ngày thu phí và trôi dần về sớm hơn. Đếm số kỳ rồi cộng một lần vào
  // `startDate` gốc cho ra 2026-05-31.
  //
  // `startDate` mang 12:00Z theo quy ước nêu ở đầu file — đây là test duy nhất
  // vốn đã làm đúng, và cũng là test duy nhất xanh ở mọi múi giờ trước lần sửa
  // này.
  it("giữ nguyên ngày 31 khi kỳ hạn đi qua tháng ngắn", () => {
    const result = nextPaymentDate(
      new Date("2026-01-31T12:00:00Z"),
      "monthly",
      new Date("2026-05-10")
    );
    expect(result.toISOString().slice(0, 10)).toBe("2026-05-31");
  });
});
