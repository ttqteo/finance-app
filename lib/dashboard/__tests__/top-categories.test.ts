import { describe, expect, it } from "vitest";
import { topCategories } from "@/lib/dashboard/top-categories";

const LABELS = { uncategorized: "Uncategorized", other: "Other" };

describe("topCategories", () => {
  it("labels the null-category bucket instead of dropping it", () => {
    // The bug this function exists to prevent: `summary.ts` inner-joined
    // `categories`, so every transaction with a NULL category_id vanished from
    // the pie while still counting toward the Expenses KPI above it.
    expect(
      topCategories([{ name: null, value: 100 }], LABELS)
    ).toEqual([{ name: "Uncategorized", value: 100 }]);
  });

  it("orders by value descending", () => {
    const result = topCategories(
      [
        { name: "Food", value: 10 },
        { name: "Rent", value: 90 },
        { name: "Fuel", value: 50 },
      ],
      LABELS
    );
    expect(result.map((r) => r.name)).toEqual(["Rent", "Fuel", "Food"]);
  });

  it("keeps the top N and rolls the rest into one Other bucket", () => {
    const result = topCategories(
      [
        { name: "A", value: 50 },
        { name: "B", value: 40 },
        { name: "C", value: 30 },
        { name: "D", value: 20 },
        { name: "E", value: 5 },
      ],
      LABELS,
      3
    );
    expect(result).toEqual([
      { name: "A", value: 50 },
      { name: "B", value: 40 },
      { name: "C", value: 30 },
      { name: "Other", value: 25 },
    ]);
  });

  it("adds no Other bucket when nothing overflows", () => {
    const result = topCategories(
      [
        { name: "A", value: 2 },
        { name: "B", value: 1 },
      ],
      LABELS,
      3
    );
    expect(result).toEqual([
      { name: "A", value: 2 },
      { name: "B", value: 1 },
    ]);
  });

  it("preserves the grand total, so the pie can be compared to the KPI", () => {
    const rows = [
      { name: null, value: 17_550_091 },
      { name: "Đồ Uống", value: 58_050 },
      { name: "Ăn Vặt", value: 20 },
      { name: "Đồ Ăn", value: 10 },
      { name: "Misc", value: 5 },
    ];
    const total = rows.reduce((a, r) => a + r.value, 0);
    const summed = topCategories(rows, LABELS, 3).reduce(
      (a, r) => a + r.value,
      0
    );
    expect(summed).toBe(total);
  });

  it("returns an empty list for no rows", () => {
    expect(topCategories([], LABELS)).toEqual([]);
  });

  it("merges several null rows into a single bucket", () => {
    // A LEFT JOIN with GROUP BY on category name yields one NULL row, but the
    // function must not depend on that.
    expect(
      topCategories(
        [
          { name: null, value: 30 },
          { name: null, value: 12 },
          { name: "A", value: 1 },
        ],
        LABELS
      )
    ).toEqual([
      { name: "Uncategorized", value: 42 },
      { name: "A", value: 1 },
    ]);
  });
});
