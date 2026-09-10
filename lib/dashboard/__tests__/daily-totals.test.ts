import { describe, expect, it } from "vitest";
import { dailyTotals, dayKey } from "@/lib/dashboard/daily-totals";

// `dailyTotals` giờ nhận múi giờ tường minh, nên bài test không còn phụ thuộc
// giờ của máy chạy nữa: fixture dựng bằng mốc UTC và gom nhóm cũng theo UTC,
// nên khoá luôn khớp `dayKey(year, month, day)` ở mọi vùng.
//
// Trước đây fixture phải đặt giữa trưa GIỜ ĐỊA PHƯƠNG để né chuyện
// `new Date("2026-08-10")` là nửa đêm UTC và rơi sang hôm trước với ai ở phía
// tây UTC — mẹo đó không cần nữa.
const TZ = "UTC";

const localNoon = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day, 12, 0, 0));

describe("dailyTotals", () => {
  it("gộp nhiều dòng cùng một ngày lịch thay vì ghi đè", () => {
    // `/api/summary` groups by full timestamp, so one calendar day can arrive
    // as several rows.
    const result = dailyTotals([
      { date: localNoon(2026, 7, 10), income: 100, expenses: 30 },
      { date: localNoon(2026, 7, 10), income: 50, expenses: 20 },
    ], TZ);

    expect(result.byDay.size).toBe(1);
    expect(result.byDay.get(dayKey(2026, 7, 10))).toEqual({
      income: 150,
      expenses: 50,
    });
  });

  it("phân biệt ngày đã hỏi mà không có gì với ngày chưa từng hỏi", () => {
    // This is the whole point of returning a Map instead of a lookup that
    // defaults to zero: a day inside the window with no activity is a fact,
    // a day outside it is an absence of information.
    const result = dailyTotals([
      { date: localNoon(2026, 7, 10), income: 0, expenses: 0 },
      { date: localNoon(2026, 7, 11), income: 0, expenses: 900 },
    ], TZ);

    const queriedButQuiet = dayKey(2026, 7, 10);
    const neverQueried = dayKey(2026, 6, 10);

    expect(result.byDay.has(queriedButQuiet)).toBe(true);
    expect(result.byDay.get(queriedButQuiet)).toEqual({
      income: 0,
      expenses: 0,
    });

    expect(result.byDay.has(neverQueried)).toBe(false);
    expect(result.byDay.get(neverQueried)).toBeUndefined();
  });

  it("trả về biên của cửa sổ theo min/max, bất kể thứ tự đầu vào", () => {
    const result = dailyTotals([
      { date: localNoon(2026, 7, 20), income: 1, expenses: 0 },
      { date: localNoon(2026, 6, 5), income: 1, expenses: 0 },
      { date: localNoon(2026, 8, 1), income: 1, expenses: 0 },
    ], TZ);

    expect(result.start).toEqual(localNoon(2026, 6, 5));
    expect(result.end).toEqual(localNoon(2026, 8, 1));
  });

  it("trả map rỗng và biên null khi không có ngày nào", () => {
    const result = dailyTotals([], TZ);

    expect(result.byDay.size).toBe(0);
    expect(result.start).toBeNull();
    expect(result.end).toBeNull();
  });

  it("đọc chuỗi ISO vào đúng ô của Date tương đương", () => {
    const date = localNoon(2026, 7, 10);
    const result = dailyTotals([
      { date, income: 1, expenses: 0 },
      { date: date.toISOString(), income: 2, expenses: 0 },
    ], TZ);

    expect(result.byDay.size).toBe(1);
    expect(result.byDay.get(dayKey(2026, 7, 10))).toEqual({
      income: 3,
      expenses: 0,
    });
  });

  it("bỏ qua ngày không parse được thay vì để nó phá biên cửa sổ", () => {
    const result = dailyTotals([
      { date: "not a date", income: 999, expenses: 999 },
      { date: localNoon(2026, 7, 10), income: 1, expenses: 2 },
    ], TZ);

    expect(result.byDay.size).toBe(1);
    expect(result.start).toEqual(localNoon(2026, 7, 10));
    expect(result.end).toEqual(localNoon(2026, 7, 10));
  });
});

describe("dailyTotals theo múi giờ", () => {
  // Đây là lý do tham số múi giờ tồn tại. Cùng một mốc thời gian, hai múi giờ,
  // hai ô lịch khác nhau — và nếu lưới lịch dùng múi khác với chỗ gom nhóm thì
  // khoản chi biến mất khỏi ô đáng lẽ phải có.
  const nearMidnightUtc = new Date("2026-08-10T23:30:00Z");

  it("xếp vào ngày 10 khi xem theo UTC", () => {
    const { byDay } = dailyTotals(
      [{ date: nearMidnightUtc, income: 0, expenses: 500 }],
      "UTC"
    );

    expect(byDay.get(dayKey(2026, 7, 10))).toEqual({ income: 0, expenses: 500 });
    expect(byDay.get(dayKey(2026, 7, 11))).toBeUndefined();
  });

  it("xếp vào ngày 11 khi xem theo giờ Việt Nam", () => {
    const { byDay } = dailyTotals(
      [{ date: nearMidnightUtc, income: 0, expenses: 500 }],
      "Asia/Ho_Chi_Minh"
    );

    expect(byDay.get(dayKey(2026, 7, 11))).toEqual({ income: 0, expenses: 500 });
    expect(byDay.get(dayKey(2026, 7, 10))).toBeUndefined();
  });

  it("gộp hai mốc rơi cùng ngày trong múi giờ người xem dù khác ngày UTC", () => {
    const { byDay } = dailyTotals(
      [
        { date: new Date("2026-08-10T17:00:00Z"), income: 100, expenses: 0 },
        { date: new Date("2026-08-11T10:00:00Z"), income: 50, expenses: 0 },
      ],
      "Asia/Ho_Chi_Minh"
    );

    expect(byDay.size).toBe(1);
    expect(byDay.get(dayKey(2026, 7, 11))).toEqual({ income: 150, expenses: 0 });
  });
});
