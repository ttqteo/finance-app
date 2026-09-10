"use client";

import { useGetSettings } from "@/features/settings/api/use-get-settings";
import { detectTimezone } from "@/lib/timezones";

/**
 * Múi giờ dùng để HIỂN THỊ mọi mốc thời gian.
 *
 * Ưu tiên lựa chọn đã lưu trong Settings. Trong lúc query chưa về — hoặc khi
 * người dùng chưa đăng nhập — lùi về múi giờ của trình duyệt, vì đó là phỏng
 * đoán sát nhất và cũng đúng bằng hành vi cũ, nên không có cú nhảy giá trị khi
 * settings vừa tải xong với người dùng ở đúng múi giờ đó.
 *
 * Lưu ý: mặc định trong database là `UTC`. Ai chưa vào Settings chọn thì sẽ
 * thấy giờ UTC sau khi query về — cố ý như vậy, vì đó là giá trị họ đang có,
 * chứ không phải thứ đoán mò từ máy.
 */
export const useTimezone = (): string => {
  const { data } = useGetSettings();

  return data?.timezone || detectTimezone();
};
