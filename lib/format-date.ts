import { formatInTimeZone } from "date-fns-tz";
import type { Locale } from "date-fns";

/**
 * Hiển thị mốc thời gian theo múi giờ NGƯỜI DÙNG CHỌN, không phải giờ máy.
 *
 * Database lưu tất cả bằng `timestamptz`, tức UTC. `format()` của date-fns thì
 * quy đổi theo giờ của máy đang chạy, nên cùng một giao dịch sẽ hiện khác nhau
 * giữa laptop ở Hà Nội và server ở Mỹ — và ở gần nửa đêm là lệch hẳn một ngày.
 *
 * Hàm này quy đổi theo `timeZone` truyền vào, nên kết quả chỉ phụ thuộc dữ liệu
 * và lựa chọn của người dùng, không phụ thuộc máy nào đang render.
 *
 * Nhận cả chuỗi ISO (dạng API trả về) lẫn `Date`.
 */
export const formatInTz = (
  value: string | number | Date,
  pattern: string,
  timeZone: string,
  locale?: Locale
): string => {
  const date = value instanceof Date ? value : new Date(value);

  // Ngày rác thì trả chuỗi rỗng thay vì để `RangeError: Invalid time value`
  // làm sập cả bảng — một hàng hỏng không đáng kéo theo cả trang.
  if (Number.isNaN(date.getTime())) return "";

  try {
    return formatInTimeZone(date, timeZone, pattern, { locale });
  } catch {
    // Múi giờ không hợp lệ (dữ liệu cũ, người dùng sửa tay) thì lùi về UTC chứ
    // không ném.
    return formatInTimeZone(date, "UTC", pattern, { locale });
  }
};

/**
 * Ngày theo dạng `yyyy-MM-dd` trong múi giờ đã chọn.
 *
 * Dùng để gom nhóm theo ngày. Cắt chuỗi ISO (`.slice(0, 10)`) là lấy ngày theo
 * UTC, sai với người dùng lệch múi giờ: 23:30 ngày 15 ở Hà Nội là 16:30 ngày 15
 * UTC — trùng khớp; nhưng 06:30 ngày 16 ở Hà Nội lại là 23:30 ngày 15 UTC, tức
 * bị đếm nhầm sang hôm trước.
 */
export const dayKeyInTz = (
  value: string | number | Date,
  timeZone: string
): string => formatInTz(value, "yyyy-MM-dd", timeZone);
