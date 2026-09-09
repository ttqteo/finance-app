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
});
