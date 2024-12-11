CREATE TABLE IF NOT EXISTS "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"language" text DEFAULT 'en',
	"currency" text DEFAULT 'USD',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
