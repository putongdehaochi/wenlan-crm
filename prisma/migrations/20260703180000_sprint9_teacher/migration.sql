-- Sprint 9: Teacher + Group.teacherId + Attendance.teacherId

CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

INSERT INTO "teachers" ("id", "name", "is_default", "created_at")
VALUES ('default-teacher', '默认老师', true, CURRENT_TIMESTAMP);

ALTER TABLE "student_groups" ADD COLUMN "teacher_id" TEXT;

ALTER TABLE "student_groups" ADD CONSTRAINT "student_groups_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "student_groups_teacher_id_idx" ON "student_groups"("teacher_id");

ALTER TABLE "attendances" ADD COLUMN "teacher_id" TEXT;

UPDATE "attendances" SET "teacher_id" = 'default-teacher' WHERE "teacher_id" IS NULL;

ALTER TABLE "attendances" ALTER COLUMN "teacher_id" SET NOT NULL;

ALTER TABLE "attendances" ADD CONSTRAINT "attendances_teacher_id_fkey"
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "attendances_teacher_id_idx" ON "attendances"("teacher_id");
