-- Sprint 7 M1: voided_at + attendance_lifecycle_events

CREATE TYPE "LifecycleEventType" AS ENUM ('CHECK_IN', 'VOID', 'RESTORE');

ALTER TABLE "attendances" ADD COLUMN "voided_at" TIMESTAMP(3);

CREATE TABLE "attendance_lifecycle_events" (
    "id" TEXT NOT NULL,
    "attendance_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "event_type" "LifecycleEventType" NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "operator_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_lifecycle_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "attendance_lifecycle_events_attendance_id_occurred_at_idx" ON "attendance_lifecycle_events"("attendance_id", "occurred_at");
CREATE INDEX "attendance_lifecycle_events_student_id_occurred_at_idx" ON "attendance_lifecycle_events"("student_id", "occurred_at");
CREATE INDEX "attendance_lifecycle_events_event_type_occurred_at_idx" ON "attendance_lifecycle_events"("event_type", "occurred_at");

ALTER TABLE "attendance_lifecycle_events" ADD CONSTRAINT "attendance_lifecycle_events_attendance_id_fkey" FOREIGN KEY ("attendance_id") REFERENCES "attendances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance_lifecycle_events" ADD CONSTRAINT "attendance_lifecycle_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill voided_at for existing VOIDED rows
UPDATE "attendances"
SET "voided_at" = "created_at"
WHERE "status" = 'VOIDED' AND "voided_at" IS NULL;

-- Backfill CHECK_IN for all existing attendances
INSERT INTO "attendance_lifecycle_events" ("id", "attendance_id", "student_id", "event_type", "occurred_at", "created_at")
SELECT
    md5(random()::text || a."id" || 'CHECK_IN') || substr(md5(a."id"), 1, 9),
    a."id",
    a."student_id",
    'CHECK_IN'::"LifecycleEventType",
    a."created_at",
    a."created_at"
FROM "attendances" a;

-- Backfill VOID for existing VOIDED attendances
INSERT INTO "attendance_lifecycle_events" ("id", "attendance_id", "student_id", "event_type", "occurred_at", "created_at")
SELECT
    md5(random()::text || a."id" || 'VOID') || substr(md5(a."id"), 1, 9),
    a."id",
    a."student_id",
    'VOID'::"LifecycleEventType",
    COALESCE(a."voided_at", a."created_at"),
    COALESCE(a."voided_at", a."created_at")
FROM "attendances" a
WHERE a."status" = 'VOIDED';
