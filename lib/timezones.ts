/**
 * Danh sách múi giờ cho ô chọn trong Settings.
 *
 * Lấy từ `Intl.supportedValuesOf("timeZone")` — tức danh sách IANA của chính
 * runtime, khỏi phải tự bảo trì một bảng cứng rồi lạc hậu dần. Trình duyệt nào
 * chưa có API đó thì lùi về một danh sách ngắn.
 *
 * Múi giờ của máy được ghim lên đầu: gần như luôn là thứ người dùng cần, và họ
 * khỏi cuộn qua mấy trăm dòng.
 */

const FALLBACK = [
  "UTC",
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
];

/** Múi giờ trình duyệt đang dùng; "UTC" nếu không đọc được. */
export const detectTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

const allTimezones = (): string[] => {
  try {
    const supported = (
      Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf?.("timeZone");

    return supported?.length ? supported : FALLBACK;
  } catch {
    return FALLBACK;
  }
};

/**
 * Danh sách để render, đã bỏ trùng: múi giờ của máy, rồi UTC, rồi phần còn lại
 * theo thứ tự bảng chữ cái.
 */
export const timezoneOptions = (): string[] => {
  const detected = detectTimezone();
  const rest = allTimezones().filter((tz) => tz !== detected && tz !== "UTC");

  return Array.from(new Set([detected, "UTC", ...rest]));
};

/** Nhãn kèm offset hiện tại, ví dụ "Asia/Ho_Chi_Minh (GMT+7)". */
export const timezoneLabel = (timeZone: string): string => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());

    const offset = parts.find((p) => p.type === "timeZoneName")?.value;

    return offset ? `${timeZone} (${offset})` : timeZone;
  } catch {
    return timeZone;
  }
};
