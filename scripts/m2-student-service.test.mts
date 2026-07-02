/**
 * @file m2-student-service.test.mts
 * @feature students
 * @purpose M2 业务层自测：Service → Validator → Repository → Mapper
 *
 * 运行：npm run test:m2
 */

import "dotenv/config"

import { studentService } from "../src/features/students/services/student.service"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m2_test__"

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

async function cleanup(): Promise<void> {
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

async function runTests(): Promise<void> {
  console.log("M2 Student Service — self test\n")
  await cleanup()

  const created = await studentService.createStudent({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
    phone: "13800000001",
  })
  assert(created.success === true, "create success")
  if (created.success) {
    assert(created.data.lessonBalance === 0, "detail lessonBalance is 0")
    assert(created.data.status === "ACTIVE", "status ACTIVE")
  }
  console.log("✓ createStudent success")

  const dup = await studentService.createStudent({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
  })
  assert(dup.success === false && dup.errorType === "DUPLICATE_STUDENT", "duplicate")
  console.log("✓ createStudent DUPLICATE_STUDENT")

  const invalid = await studentService.createStudent({
    name: "",
    contactName: "明妈",
  })
  assert(
    invalid.success === false && invalid.errorType === "VALIDATION_ERROR",
    "validation name"
  )
  console.log("✓ createStudent VALIDATION_ERROR")

  const list = await studentService.listActiveStudents()
  assert(list.success === true, "list success")
  if (list.success) {
    const row = list.data.find((s) => s.name === `${TEST_PREFIX}小明`)
    assert(row != null && row.lessonBalance === 0, "list lessonBalance 0")
  }
  console.log("✓ listActiveStudents")

  if (created.success) {
    const detail = await studentService.getStudentDetail(created.data.id)
    assert(detail.success === true, "get detail success")

    const notFound = await studentService.getStudentDetail("nonexistent-id")
    assert(
      notFound.success === false && notFound.errorType === "STUDENT_NOT_FOUND",
      "not found"
    )

    const badId = await studentService.getStudentDetail("")
    assert(
      badId.success === false && badId.errorType === "VALIDATION_ERROR",
      "bad id"
    )
  }
  console.log("✓ getStudentDetail")

  await cleanup()
  console.log("\nAll M2 service tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM2 test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
