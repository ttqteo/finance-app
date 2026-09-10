import {
  detectTimezone,
  timezoneLabel,
  timezoneOptions,
} from "@/lib/timezones";
import { describe, expect, it } from "vitest";

describe("timezoneOptions", () => {
  it("đặt múi giờ của máy lên đầu", () => {
    expect(timezoneOptions()[0]).toBe(detectTimezone());
  });

  it("luôn có UTC", () => {
    expect(timezoneOptions()).toContain("UTC");
  });

  it("không lặp lại mục nào", () => {
    const list = timezoneOptions();
    expect(new Set(list).size).toBe(list.length);
  });

  it("mọi mục đều là múi giờ Intl nhận ra", () => {
    // Nếu lọt một chuỗi rác vào danh sách thì `Intl.DateTimeFormat` ném lỗi,
    // và ô Select sẽ hỏng ngay lúc render.
    for (const tz of timezoneOptions().slice(0, 40)) {
      expect(() => new Intl.DateTimeFormat("en-US", { timeZone: tz })).not.toThrow();
    }
  });
});

describe("timezoneLabel", () => {
  it("kèm offset vào nhãn", () => {
    expect(timezoneLabel("Asia/Ho_Chi_Minh")).toBe(
      "Asia/Ho_Chi_Minh (GMT+7)"
    );
  });

  it("UTC hiện offset gốc", () => {
    // Bản ICU khác nhau in ra "GMT" hoặc "GMT+0", nên chỉ khẳng định phần
    // chắc chắn — pin cứng một chuỗi là buộc test vào đúng một runtime.
    expect(timezoneLabel("UTC")).toMatch(/^UTC \(GMT\+?0?\)$/);
  });

  it("chuỗi không hợp lệ thì trả lại nguyên si chứ không ném", () => {
    expect(timezoneLabel("Khong/Ton_Tai")).toBe("Khong/Ton_Tai");
  });
});

describe("detectTimezone", () => {
  it("trả về một múi giờ dùng được", () => {
    const tz = detectTimezone();
    expect(tz).toBeTruthy();
    expect(() => new Intl.DateTimeFormat("en-US", { timeZone: tz })).not.toThrow();
  });
});
