-- Chuyển mọi mốc thời gian sang `timestamptz`, và thêm múi giờ hiển thị vào
-- settings.
--
-- SỬA TAY so với bản `drizzle-kit generate`: nó sinh ra `SET DATA TYPE timestamp
-- with time zone` mà KHÔNG có `USING`. Thiếu mệnh đề đó thì Postgres diễn giải
-- giá trị `timestamp` trần theo TimeZone CỦA PHIÊN. Phiên không phải UTC là mọi
-- hàng lệch đi đúng bằng offset đó — lặng lẽ, không lỗi.
--
-- Bảng đang rỗng nên lần chạy này vô hại, nhưng để nguyên là cài sẵn một quả
-- mìn cho lần sau, và nó đi ngược đúng cái bất biến vừa đặt ra. `AT TIME ZONE
-- 'UTC'` nói thẳng: giá trị đang lưu là UTC, hãy hiểu đúng như vậy.
--
-- Sau bước này UTC là bất biến ở tầng database chứ không còn là quy ước:
-- `timestamptz` luôn lưu theo UTC và PostgREST trả về chuỗi CÓ offset, nên
-- không còn chuỗi mập mờ thiếu múi giờ nữa.

ALTER TABLE "subscriptions" ALTER COLUMN "start_date" SET DATA TYPE timestamp with time zone USING "start_date" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "date" SET DATA TYPE timestamp with time zone USING "date" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "start_date" SET DATA TYPE timestamp with time zone USING "start_date" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "end_date" SET DATA TYPE timestamp with time zone USING "end_date" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "renewal_date" SET DATA TYPE timestamp with time zone USING "renewal_date" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "stripe_current_period_end" SET DATA TYPE timestamp with time zone USING "stripe_current_period_end" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone USING "created_at" AT TIME ZONE 'UTC';--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone USING "updated_at" AT TIME ZONE 'UTC';--> statement-breakpoint

-- Múi giờ HIỂN THỊ, dạng IANA. Không ảnh hưởng cách lưu — chỉ quyết định quy
-- đổi ra giờ nào khi hiện lên màn hình.
ALTER TABLE "user_settings" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;
