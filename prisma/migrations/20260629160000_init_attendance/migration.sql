-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('VALID', 'VOIDED');

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'VALID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendances_attendance_date_idx" ON "attendances"("attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_student_id_attendance_date_key" ON "attendances"("student_id", "attendance_date");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
