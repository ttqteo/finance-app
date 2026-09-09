import { describe, expect, it } from "vitest";
import { dailyTotals, dayKey } from "@/lib/dashboard/daily-totals";

// Fixtures are built from local date parts at midday. A bare
// `new Date("2026-08-10")` is UTC midnight, which lands on the previous day for
// anyone west of UTC and would make these assertions depend on the machine's
// zone. See the note in `lib/dashboard/next-payment-date.ts`.
const localNoon = (year: number, month: number, day: number) =>
  new Date(year, month, day, 12, 0, 0);

describe("dailyTotals", () => {
  it("gộp nhiều dòng cùng một ngày lịch thay vì ghi đè", () => {
    // `/api/summary` groups by full timestamp, so one calendar day can arrive
    // as several rows.
    const result = dailyTotals([
      { date: localNoon(2026, 7, 10), income: 100, expenses: 30 },
      { date: localNoon(2026, 7, 10), income: 50, expenses: 20 },
    ]);

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
    ]);

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
    ]);

    expect(result.start).toEqual(localNoon(2026, 6, 5));
    expect(result.end).toEqual(localNoon(2026, 8, 1));
  });

  it("trả map rỗng và biên null khi không có ngày nào", () => {
    const result = dailyTotals([]);

    expect(result.byDay.size).toBe(0);
    expect(result.start).toBeNull();
    expect(result.end).toBeNull();
  });

  it("đọc chuỗi ISO vào đúng ô của Date tương đương", () => {
    const date = localNoon(2026, 7, 10);
    const result = dailyTotals([
      { date, income: 1, expenses: 0 },
      { date: date.toISOString(), income: 2, expenses: 0 },
    ]);

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
    ]);

    expect(result.byDay.size).toBe(1);
    expect(result.start).toEqual(localNoon(2026, 7, 10));
    expect(result.end).toEqual(localNoon(2026, 7, 10));
  });
});
