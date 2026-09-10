-- Sinh bằng `drizzle-kit generate` rồi SỬA TAY. Ba chỗ phải sửa:
--
-- 1. Bản sinh ra đặt composite FK của `transactions` TRƯỚC khi thêm UNIQUE
--    (id, user_id) trên `accounts`. Postgres từ chối FK trỏ vào bộ cột chưa có
--    ràng buộc unique, nên thứ tự đó chắc chắn lỗi. Đã đảo lại.
-- 2. `SET DATA TYPE uuid` thiếu `USING`. text → uuid không có cast ngầm, nên
--    câu lệnh lỗi kể cả khi bảng rỗng. Đã thêm `USING "user_id"::uuid`.
-- 3. Drizzle không mô tả được ràng buộc sang schema `auth`, nên các FK trỏ
--    `auth.users(id)` phải viết tay ở cuối file.

-- FK đơn cột cũ nhường chỗ cho composite FK bên dưới.
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_account_id_accounts_id_fk";
--> statement-breakpoint

ALTER TABLE "accounts" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint

-- Phải có TRƯỚC composite FK: đây chính là ràng buộc unique mà FK kia trỏ vào.
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_id_user_id_key" UNIQUE("id","user_id");--> statement-breakpoint

ALTER TABLE "transactions" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_user_id_fkey" FOREIGN KEY ("account_id","user_id") REFERENCES "public"."accounts"("id","user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Gắn mọi user_id vào auth.users của Supabase. Xoá user là dọn sạch dữ liệu
-- của họ theo, khỏi để lại hàng mồ côi không ai với tới được.
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
