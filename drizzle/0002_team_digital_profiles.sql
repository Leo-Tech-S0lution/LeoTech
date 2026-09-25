CREATE TABLE "profile_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_member_id" uuid NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"device_type" varchar(20),
	"browser" varchar(40),
	"os" varchar(40),
	"referrer" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "team_member_slug_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_member_id" uuid NOT NULL,
	"slug" varchar(200) NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_member_slug_history_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "first_name" varchar(60);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "middle_name" varchar(60);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "last_name" varchar(60);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "slug" varchar(200);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "employee_id" varchar(40);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "department" varchar(120);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "joining_date" date;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "employment_type" "employment_type";--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "biography" text;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "phone" varchar(40);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "whatsapp" varchar(40);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "location" varchar(160);--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "experience" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "education" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "projects" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "certifications" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "qr_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "qr_generated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "qr_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_team_member_id_team_members_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_slug_history" ADD CONSTRAINT "team_member_slug_history_team_member_id_team_members_id_fk" FOREIGN KEY ("team_member_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profile_views_member_time_idx" ON "profile_views" USING btree ("team_member_id","viewed_at");--> statement-breakpoint
CREATE INDEX "slug_history_member_idx" ON "team_member_slug_history" USING btree ("team_member_id");--> statement-breakpoint
-- Backfill slugs for existing members from their names (non-destructive).
-- Duplicate names get a numeric suffix so the unique constraint below holds.
WITH base AS (
	SELECT "id",
		COALESCE(NULLIF(trim(both '-' from lower(regexp_replace(trim("name"), '[^a-zA-Z0-9]+', '-', 'g'))), ''), 'member') AS "s",
		row_number() OVER (
			PARTITION BY COALESCE(NULLIF(trim(both '-' from lower(regexp_replace(trim("name"), '[^a-zA-Z0-9]+', '-', 'g'))), ''), 'member')
			ORDER BY "order", "id"
		) AS "n"
	FROM "team_members"
	WHERE "slug" IS NULL
)
UPDATE "team_members" t
SET "slug" = CASE WHEN base."n" = 1 THEN base."s" ELSE base."s" || '-' || base."n" END
FROM base
WHERE t."id" = base."id";--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_slug_unique" UNIQUE("slug");--> statement-breakpoint
-- Existing members already appear on the site, so give them a QR and a current slug-history entry.
UPDATE "team_members" SET "qr_generated_at" = now() WHERE "qr_generated_at" IS NULL AND "qr_enabled" = true;--> statement-breakpoint
INSERT INTO "team_member_slug_history" ("team_member_id", "slug", "is_current")
SELECT "id", "slug", true FROM "team_members"
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_employee_id_unique" UNIQUE("employee_id");