ALTER TABLE "subscriptions" ADD COLUMN "start_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "currency" text DEFAULT 'VND' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "has_free_trial" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN IF EXISTS "renewal_date";