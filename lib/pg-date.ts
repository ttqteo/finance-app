/**
 * Chốt chặn cuối cho việc đọc mốc thời gian từ PostgREST.
 *
 * Bối cảnh: Drizzle (mode "date") trả `Date`, PostgREST trả CHUỖI. Hồi các cột
 * còn là `timestamp` trần, chuỗi đó trông như `"2026-01-15T00:00:00"` — không
 * `Z`, không offset — mà `new Date()` đọc chuỗi ISO thiếu múi giờ theo GIỜ ĐỊA
 * PHƯƠNG. Ở UTC+7 là giao dịch nửa đêm nhảy về hôm trước.
 *
 * Từ migration 0012 mọi cột đã là `timestamptz`, nên PostgREST luôn trả kèm
 * offset và hàm này gần như chỉ còn cho chuỗi đi qua. Vẫn giữ vì nó rẻ và vì
 * nó biến một giả định ngầm thành thứ có test: cột mới ai đó lỡ khai bằng
 * `timestamp` trần thì chỗ này vẫn đỡ được, thay vì âm thầm lệch một múi giờ.
 *
 * Quy ước: chuỗi thiếu múi giờ được hiểu là UTC.
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
