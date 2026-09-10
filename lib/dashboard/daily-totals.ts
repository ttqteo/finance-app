import { formatInTimeZone } from "date-fns-tz";

export type DailySummaryRow = {
  date: string | Date;
  income: number;
  expenses: number;
};

export type DayTotals = { income: number; expenses: number };

export type DailyTotals = {
  /**
   * Keyed by local calendar day. A key is present if and only if that day fell
   * inside the queried window, so `byDay.has(key)` answers "was this day asked
   * about?" and `byDay.get(key)` answers "what happened on it?". Those are two
   * different questions and a calendar that conflates them reports days it
   * never asked about as days on which nothing happened.
   */
  byDay: Map<string, DayTotals>;
  /** Earliest and latest day in the window, or null when nothing was queried. */
  start: Date | null;
  end: Date | null;
};

/**
 * Khoá theo ngày lịch. `summary.days[].date` về dưới dạng mốc thời gian ISO,
 * còn lưới lịch dựng từ số ngày/tháng/năm, nên khoá phải tính theo cùng một
 * múi giờ với lưới — lệch múi là một khoản chi rơi sang ô bên cạnh.
 *
 * `month` đếm từ 0 cho khớp `Date.getMonth()`. Ba phần nối bằng ký tự không
 * thể xuất hiện bên trong chúng nên khoá không đụng nhau dù không đệm số 0.
 */
export const dayKey = (year: number, month: number, day: number) =>
  `${year}-${month}-${day}`;

/**
 * Ngày/tháng/năm của một mốc thời gian TRONG MÚI GIỜ chỉ định.
 *
 * Trước đây chỗ này dùng `getFullYear/getMonth/getDate`, tức giờ của MÁY đang
 * render. Người dùng ở UTC+7 xem trên server đặt UTC là giao dịch lúc 06:30
 * sáng bị xếp vào hôm trước. Giờ nó phụ thuộc lựa chọn trong Settings chứ
 * không phụ thuộc máy nào chạy.
 */
export const dayPartsInTz = (date: Date, timeZone: string) => {
  const [year, month, day] = formatInTimeZone(date, timeZone, "yyyy-M-d")
    .split("-")
    .map(Number);

  return { year, month: month - 1, day };
};

const keyOf = (date: Date, timeZone: string) => {
  const { year, month, day } = dayPartsInTz(date, timeZone);
  return dayKey(year, month, day);
};

/**
 * Folds `/api/summary`'s `days[]` into per-calendar-day totals plus the bounds
 * of the window they cover.
 *
 * `fillMissingDays` (`lib/utils.ts`) emits an entry for every day in
 * `[startDate, endDate]` once there is at least one active day, so the window
 * is exactly the set of keys — a caller does not have to re-derive it from the
 * URL filter and cannot drift from what the server actually answered.
 *
 * Totals are accumulated rather than overwritten. `/api/summary` groups by full
 * timestamp, so one calendar day is not guaranteed to arrive as a single row.
 * Both figures are already non-negative: the endpoint applies `ABS()` to the
 * expense sum.
 */
export function dailyTotals(
  rows: DailySummaryRow[],
  timeZone: string
): DailyTotals {
  const byDay = new Map<string, DayTotals>();
  let start: Date | null = null;
  let end: Date | null = null;

  for (const row of rows) {
    const date = typeof row.date === "string" ? new Date(row.date) : row.date;

    // Unreachable from `/api/summary`, whose dates are database timestamps or
    // `eachDayOfInterval` output. Skipped rather than kept because an Invalid
    // Date compares false against everything: it would win the `start === null`
    // check, poison the window bounds for every other day, and reach `format()`
    // as a RangeError with no error boundary above the widget.
    if (Number.isNaN(date.getTime())) continue;

    const key = keyOf(date, timeZone);
    const bucket = byDay.get(key) ?? { income: 0, expenses: 0 };
    bucket.income += row.income;
    bucket.expenses += row.expenses;
    byDay.set(key, bucket);

    if (start === null || date < start) start = date;
    if (end === null || date > end) end = date;
  }

  return { byDay, start, end };
}
