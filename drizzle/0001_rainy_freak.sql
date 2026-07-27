ALTER TABLE "user" ADD COLUMN "instance_key" text DEFAULT 'owner' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "user_singleton_unique" ON "user" USING btree ("instance_key");