ALTER TABLE "user_settings" ALTER COLUMN "timezone" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "timezone" DROP NOT NULL;