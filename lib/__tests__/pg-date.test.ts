import { pgTimestampToIso, pgTimestampToIsoOrNull } from "@/lib/pg-date";
import { describe, expect, it } from "vitest";

// Bài test đáng giá nhất ở đây là bài cuối: nó khoá lại đúng chỗ mà việc đổi
// từ Drizzle sang supabase-js làm lệch múi giờ. Chạy được ở mọi TZ vì so bằng
// mốc tuyệt đối (`getTime`), không so chuỗi giờ địa phương.
describe("pgTimestampToIso", () => {
  it("gắn Z vào chuỗi timestamp không có múi giờ", () => {
    expect(pgTimestampToIso("2026-01-15T00:00:00")).toBe(
      "2026-01-15T00:00:00Z"
    );
  });

  it("giữ nguyên chuỗi đã có Z", () => {
    expect(pgTimestampToIso("2026-01-15T00:00:00.000Z")).toBe(
      "2026-01-15T00:00:00.000Z"
    );
  });

  it("giữ nguyên chuỗi đã có offset", () => {
    expect(pgTimestampToIso("2026-01-15T07:00:00+07:00")).toBe(
      "2026-01-15T07:00:00+07:00"
    );
    expect(pgTimestampToIso("2026-01-15T07:00:00+0700")).toBe(
      "2026-01-15T07:00:00+0700"
    );
  });

  it("đổi dấu cách của PostgREST thành T", () => {
    expect(pgTimestampToIso("2026-01-15 00:00:00")).toBe(
      "2026-01-15T00:00:00Z"
    );
  });

  it("giữ phần mili giây", () => {
    expect(pgTimestampToIso("2026-01-15T00:00:00.123")).toBe(
      "2026-01-15T00:00:00.123Z"
    );
  });

  it("đọc ra ĐÚNG THỜI ĐIỂM bằng với bản Drizzle cũ", () => {
    // Drizzle mode "date" giữ Date rồi JSON.stringify ra chuỗi UTC này.
    const quaDrizzle = new Date("2026-01-15T00:00:00.000Z").getTime();

    // Cùng hàng đó qua PostgREST về dạng thiếu múi giờ.
    const thoChuaChuanHoa = new Date("2026-01-15T00:00:00").getTime();
    const daChuanHoa = new Date(
      pgTimestampToIso("2026-01-15T00:00:00")
    ).getTime();

    expect(daChuanHoa).toBe(quaDrizzle);

    // Và đây là lý do hàm này tồn tại: ở múi giờ khác UTC, chuỗi thô lệch hẳn.
    // Ở UTC thì hai giá trị trùng nhau nên chỉ khẳng định khi thật sự lệch.
    if (new Date("2026-01-15T00:00:00").getTimezoneOffset() !== 0) {
      expect(thoChuaChuanHoa).not.toBe(quaDrizzle);
    }
  });
});

describe("pgTimestampToIsoOrNull", () => {
  it("cho null đi qua", () => {
    expect(pgTimestampToIsoOrNull(null)).toBeNull();
  });

  it("chuẩn hoá chuỗi như bản không null", () => {
    expect(pgTimestampToIsoOrNull("2026-01-15T00:00:00")).toBe(
      "2026-01-15T00:00:00Z"
    );
  });
});
