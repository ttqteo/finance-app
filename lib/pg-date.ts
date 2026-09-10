/**
 * Drizzle (mode "date") trả về `Date`. PostgREST trả về CHUỖI.
 *
 * Với cột `timestamp` (không có múi giờ), chuỗi đó trông như
 * `"2026-01-15T00:00:00"` — không có `Z`, không có offset. Và `new Date()` đọc
 * chuỗi ISO KHÔNG có múi giờ theo GIỜ ĐỊA PHƯƠNG, trong khi cùng dữ liệu đó qua
 * Drizzle rồi `JSON.stringify` lại ra `"2026-01-15T00:00:00.000Z"`, tức UTC.
 *
 * Bỏ qua chỗ này là lệch nguyên một múi giờ: ở Việt Nam (UTC+7) giao dịch nửa
 * đêm nhảy về ngày hôm trước, đúng loại lỗi mà mấy cái test trong
 * `lib/dashboard/__tests__/` đã phải đi dọn một lần rồi.
 *
 * Quy ước: dữ liệu trong cột `timestamp` là UTC (Drizzle vẫn luôn ghi vào như
 * vậy), nên chuỗi thiếu múi giờ được hiểu là UTC.
 */

/** Chuỗi timestamp của Postgres có mang sẵn múi giờ không? */
const hasTimezone = (value: string) =>
  /(?:Z|[+-]\d{2}(?::?\d{2})?)$/.test(value);

/**
 * Chuẩn hoá một timestamp Postgres về ISO có múi giờ, để `new Date()` đọc ra
 * đúng thời điểm ở mọi máy.
 */
export const pgTimestampToIso = (value: string): string => {
  // PostgREST đôi khi dùng dấu cách thay cho "T".
  const isoish = value.includes("T") ? value : value.replace(" ", "T");

  return hasTimezone(isoish) ? isoish : `${isoish}Z`;
};

/** Như trên nhưng cho cột cho phép NULL. */
export const pgTimestampToIsoOrNull = (value: string | null): string | null =>
  value === null ? null : pgTimestampToIso(value);
