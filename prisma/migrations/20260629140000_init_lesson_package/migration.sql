-- CreateTable
CREATE TABLE "lesson_packages" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_packages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "lesson_packages_quantity_positive" CHECK ("quantity" > 0)
);

-- CreateIndex
CREATE INDEX "lesson_packages_student_id_idx" ON "lesson_packages"("student_id");

-- AddForeignKey
ALTER TABLE "lesson_packages" ADD CONSTRAINT "lesson_packages_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
