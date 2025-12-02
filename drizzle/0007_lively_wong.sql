ALTER TABLE "user_subscriptions" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD COLUMN "stripe_price_id" text;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD COLUMN "stripe_current_period_end" timestamp;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD COLUMN "cancel_at_period_end" boolean DEFAULT false;