import { describe, expect, it } from "vitest";
import { aggregateByMonth } from "@/lib/dashboard/aggregate-by-month";

describe("aggregateByMonth", () => {
  it("gộp thu và chi theo tháng, chi trả về số dương", () => {
    const result = aggregateByMonth([
      { date: "2026-01-05", amount: 5000 },
      { date: "2026-01-20", amount: -1200 },
      { date: "2026-02-03", amount: -800 },
    ]);

    expect(result).toEqual([
      { month: "2026-01", name: "Jan", Income: 5000, Expenses: 1200, Savings: 3800 },
      { month: "2026-02", name: "Feb", Income: 0, Expenses: 800, Savings: -800 },
    ]);
  });

  it("trả mảng rỗng khi không có giao dịch", () => {
    expect(aggregateByMonth([])).toEqual([]);
  });

  it("sắp xếp theo tháng tăng dần bất kể thứ tự đầu vào", () => {
    const result = aggregateByMonth([
      { date: "2026-03-01", amount: 100 },
      { date: "2026-01-01", amount: 100 },
    ]);
    expect(result.map((r) => r.month)).toEqual(["2026-01", "2026-03"]);
  });
});
