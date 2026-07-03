-- Student Group: saved groups for attendance filtering (UI layer only)

CREATE TYPE "StudentGroupType" AS ENUM ('SAVED');

CREATE TABLE "student_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StudentGroupType" NOT NULL DEFAULT 'SAVED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_group_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_group_members_group_id_student_id_key" ON "student_group_members"("group_id", "student_id");
CREATE INDEX "student_group_members_group_id_idx" ON "student_group_members"("group_id");
CREATE INDEX "student_group_members_student_id_idx" ON "student_group_members"("student_id");

ALTER TABLE "student_group_members" ADD CONSTRAINT "student_group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "student_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_group_members" ADD CONSTRAINT "student_group_members_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attendances" ADD COLUMN "group_id" TEXT;
CREATE INDEX "attendances_group_id_idx" ON "attendances"("group_id");
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "student_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
