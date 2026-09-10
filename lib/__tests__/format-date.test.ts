import { dayKeyInTz, formatInTz } from "@/lib/format-date";
import { describe, expect, it } from "vitest";

describe("formatInTz", () => {
  it("quy đổi UTC sang múi giờ được chọn", () => {
    // 2026-01-15T17:00:00Z là 00:00 ngày 16 ở Hà Nội (UTC+7).
    expect(formatInTz("2026-01-15T17:00:00Z", "yyyy-MM-dd HH:mm", "Asia/Ho_Chi_Minh"))
      .toBe("2026-01-16 00:00");
    expect(formatInTz("2026-01-15T17:00:00Z", "yyyy-MM-dd HH:mm", "UTC"))
      .toBe("2026-01-15 17:00");
  });

  it("KHÔNG phụ thuộc múi giờ của máy đang chạy", () => {
    // Đây là điểm mấu chốt: cùng dữ liệu, cùng lựa chọn, thì mọi máy phải ra
    // cùng một chuỗi. `format()` của date-fns không có tính chất này.
    const out = formatInTz("2026-01-15T17:00:00Z", "yyyy-MM-dd", "Asia/Tokyo");
    expect(out).toBe("2026-01-16");
  });

  it("nhận cả Date lẫn số", () => {
    const d = new Date("2026-06-01T12:00:00Z");
    expect(formatInTz(d, "yyyy-MM-dd", "UTC")).toBe("2026-06-01");
    expect(formatInTz(d.getTime(), "yyyy-MM-dd", "UTC")).toBe("2026-06-01");
  });

  it("chuỗi thiếu múi giờ được hiểu theo giờ máy, nên nên truyền chuỗi có Z", () => {
    // Ghi lại hành vi thật để khỏi ai đó tưởng hàm này tự vá chuỗi trần —
    // việc chuẩn hoá là của `pgTimestampToIso`.
    expect(formatInTz("2026-01-15T00:00:00Z", "yyyy-MM-dd", "UTC")).toBe(
      "2026-01-15"
    );
  });

  it("ngày rác trả chuỗi rỗng chứ không ném", () => {
    expect(formatInTz("không phải ngày", "yyyy-MM-dd", "UTC")).toBe("");
    expect(formatInTz(Number.NaN, "yyyy-MM-dd", "UTC")).toBe("");
  });

  it("múi giờ sai thì lùi về UTC chứ không ném", () => {
    expect(formatInTz("2026-01-15T17:00:00Z", "yyyy-MM-dd HH:mm", "Khong/Ton_Tai"))
      .toBe("2026-01-15 17:00");
  });

  it("theo đúng quy tắc giờ mùa hè", () => {
    // New York: 2026-07-01 là EDT (UTC-4), 2026-01-01 là EST (UTC-5).
    expect(formatInTz("2026-07-01T12:00:00Z", "HH:mm", "America/New_York")).toBe("08:00");
    expect(formatInTz("2026-01-01T12:00:00Z", "HH:mm", "America/New_York")).toBe("07:00");
  });
});

describe("dayKeyInTz", () => {
  it("gom nhóm theo ngày của người dùng, không phải ngày UTC", () => {
    // 23:30 ngày 15 UTC đã là ngày 16 ở Hà Nội.
    expect(dayKeyInTz("2026-01-15T23:30:00Z", "Asia/Ho_Chi_Minh")).toBe("2026-01-16");
    expect(dayKeyInTz("2026-01-15T23:30:00Z", "UTC")).toBe("2026-01-15");
  });

  it("khác hẳn kiểu cắt chuỗi ISO", () => {
    const iso = "2026-01-15T23:30:00Z";
    expect(iso.slice(0, 10)).toBe("2026-01-15");
    expect(dayKeyInTz(iso, "Asia/Ho_Chi_Minh")).not.toBe(iso.slice(0, 10));
  });
});
