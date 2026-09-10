-- Bật RLS và gắn policy "chỉ hàng của mình" cho cả 6 bảng.
--
-- Lúc migration này chạy, Drizzle vẫn nối bằng role owner nên BỎ QUA RLS —
-- không gãy gì trong lúc policy hạ cánh. Policy chỉ thật sự có hiệu lực từ khi
-- handler chuyển sang supabase-js với JWT của user (Task 15–19).
--
-- `with check` là phần dễ quên nhất: thiếu nó thì user vẫn GHI được hàng gắn
-- `user_id` của người khác, `using` chỉ lọc lúc đọc.
--
-- `transactions` không cần policy dạng join dù nó tham chiếu accounts: cột
-- `user_id` của nó đã được composite FK ở migration 0009 ép phải trùng chủ sở
-- hữu của account, nên so trực tiếp là đủ và rẻ hơn hẳn.

ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

DROP POLICY IF EXISTS "own rows" ON "accounts";--> statement-breakpoint
CREATE POLICY "own rows" ON "accounts"
  FOR ALL TO authenticated
  USING (auth.uid() = "user_id")
  WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint

DROP POLICY IF EXISTS "own rows" ON "categories";--> statement-breakpoint
CREATE POLICY "own rows" ON "categories"
  FOR ALL TO authenticated
  USING (auth.uid() = "user_id")
  WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint

DROP POLICY IF EXISTS "own rows" ON "transactions";--> statement-breakpoint
CREATE POLICY "own rows" ON "transactions"
  FOR ALL TO authenticated
  USING (auth.uid() = "user_id")
  WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint

DROP POLICY IF EXISTS "own rows" ON "subscriptions";--> statement-breakpoint
CREATE POLICY "own rows" ON "subscriptions"
  FOR ALL TO authenticated
  USING (auth.uid() = "user_id")
  WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint

-- `settings.ts` tự tạo hàng khi user chưa có cấu hình, nên nhánh INSERT ở đây
-- là bắt buộc — `FOR ALL` đã phủ.
DROP POLICY IF EXISTS "own rows" ON "user_settings";--> statement-breakpoint
CREATE POLICY "own rows" ON "user_settings"
  FOR ALL TO authenticated
  USING (auth.uid() = "user_id")
  WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint

-- Gói cước thì user chỉ được ĐỌC của mình; thay đổi là việc của webhook thanh
-- toán chạy bằng service role (service role bỏ qua RLS nên không cần policy).
DROP POLICY IF EXISTS "own rows" ON "user_subscriptions";--> statement-breakpoint
CREATE POLICY "own rows" ON "user_subscriptions"
  FOR SELECT TO authenticated
  USING (auth.uid() = "user_id");
