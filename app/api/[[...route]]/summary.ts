import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";
import { pgTimestampToIso } from "@/lib/pg-date";
import { getSupabase, getUser } from "@/lib/supabase/hono";
import { zValidator } from "@hono/zod-validator";
import { differenceInDays, parse, subDays } from "date-fns";
import { Hono } from "hono";
import { z } from "zod";

/**
 * Hình dạng JSON mà hàm `summary()` trong database trả về
 * (xem `drizzle/0011_summary_function.sql`).
 */
type SummaryPayload = {
  current: { income: number; expenses: number; remaining: number };
  last: { income: number; expenses: number; remaining: number };
  categories: { name: string | null; value: number }[];
  days: { date: string; income: number; expenses: number }[];
};

const app = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      accountId: z.string().optional(),
    })
  ),
  async (c) => {
    const user = await getUser(c);
    const { from, to, accountId } = c.req.valid("query");

    if (!user) {
      return c.json({ error: "Unauthorized!" }, 401);
    }

    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);

    const startDate = from
      ? parse(from, "yyyy-MM-dd", new Date())
      : defaultFrom;
    const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

    // Mốc kỳ trước vẫn tính bằng date-fns rồi truyền xuống, thay vì để SQL tự
    // tính: hai thư viện không nhất thiết chia ngày giống nhau ở biên, giữ một
    // nguồn duy nhất cho phép tính này an toàn hơn.
    const periodLength = differenceInDays(endDate, startDate) + 1;
    const lastPeriodStart = subDays(startDate, periodLength);
    const lastPeriodEnd = subDays(endDate, periodLength);

    // Bốn truy vấn tổng hợp cũ gộp thành một lời gọi. `security invoker` nên
    // RLS vẫn lọc theo user.
    const { data, error } = await getSupabase(c).rpc("summary", {
      p_from: startDate.toISOString(),
      p_to: endDate.toISOString(),
      p_last_from: lastPeriodStart.toISOString(),
      p_last_to: lastPeriodEnd.toISOString(),
      p_account_id: accountId ?? null,
    });

    if (error || !data) {
      return c.json({ error: error?.message ?? "Failed to load summary" }, 500);
    }

    const summary = data as unknown as SummaryPayload;

    const incomeChange = calculatePercentageChange(
      summary.current.income,
      summary.last.income
    );
    const expensesChange = calculatePercentageChange(
      summary.current.expenses,
      summary.last.expenses
    );
    const remainingChange = calculatePercentageChange(
      summary.current.remaining,
      summary.last.remaining
    );

    // `fillMissingDays` ở lại TypeScript: nó là hàm thuần đã có test trong
    // `lib/dashboard/__tests__/`, dịch sang SQL là vứt luôn chỗ test đó.
    const days = fillMissingDays(
      summary.days.map((day) => ({
        date: new Date(pgTimestampToIso(day.date)),
        income: day.income,
        expenses: day.expenses,
      })),
      startDate,
      endDate
    );

    return c.json({
      data: {
        remainingAmount: summary.current.remaining,
        remainingChange,
        incomeAmount: summary.current.income,
        incomeChange,
        expensesAmount: summary.current.expenses,
        expensesChange,
        categories: summary.categories,
        days,
      },
    });
  }
);

export default app;
