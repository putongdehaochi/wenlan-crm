/**
 * @file m2-lesson-service.test.mts
 * @feature lessons
 * @purpose M2 业务层自测：Lesson Service + Student 余额接入
 *
 * 运行：npm run test:m2-lesson
 */

import "dotenv/config"

import { createLessonPurchaseAction } from "../src/features/lessons/actions/create-lesson-purchase.action"
import { lessonService } from "../src/features/lessons/services/lesson.service"
import { listStudentsAction } from "../src/features/students/actions/list-students.action"
import { getStudentAction } from "../src/features/students/actions/get-student.action"
import { studentService } from "../src/features/students/services/student.service"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m2_lesson__"

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

async function cleanup(): Promise<void> {
  await prisma.lessonPackage.deleteMany({
    where: { student: { name: { startsWith: TEST_PREFIX } } },
  })
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

async function runTests(): Promise<void> {
  console.log("M2 Lesson Service — self test\n")
  await cleanup()

  const created = await studentService.createStudent({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
    phone: "13800000001",
  })
  assert(created.success === true, "create student")
  if (!created.success) throw new Error("setup failed")

  const studentId = created.data.id
  assert(created.data.lessonBalance === 0, "new student balance 0")
  console.log("✓ new student lessonBalance 0")

  const purchase = await lessonService.createLessonPurchase({
    studentId,
    quantity: 10,
    note: "首次购课",
  })
  assert(purchase.success === true, "createLessonPurchase success")
  if (purchase.success) {
    assert(purchase.data.lessonBalance === 10, "purchase result balance 10")
    assert(purchase.data.quantity === 10, "purchase quantity")
  }
  console.log("✓ createLessonPurchase success")

  const dupPurchase = await lessonService.createLessonPurchase({
    studentId,
    quantity: 5,
  })
  assert(dupPurchase.success === true, "second purchase")
  if (dupPurchase.success) {
    assert(dupPurchase.data.lessonBalance === 15, "accumulated balance 15")
  }
  console.log("✓ createLessonPurchase accumulated balance")

  const zeroQty = await lessonService.createLessonPurchase({
    studentId,
    quantity: 0,
  })
  assert(
    zeroQty.success === false && zeroQty.errorType === "VALIDATION_ERROR",
    "quantity 0 validation"
  )
  console.log("✓ VALIDATION_ERROR quantity 0")

  const notFound = await lessonService.createLessonPurchase({
    studentId: "nonexistent-id",
    quantity: 10,
  })
  assert(
    notFound.success === false && notFound.errorType === "STUDENT_NOT_FOUND",
    "student not found"
  )
  console.log("✓ STUDENT_NOT_FOUND")

  await prisma.student.create({
    data: {
      name: `${TEST_PREFIX}归档`,
      contactName: "归档妈",
      status: "ARCHIVED",
    },
  })
  const archivedStudent = await prisma.student.findFirst({
    where: { name: `${TEST_PREFIX}归档` },
  })
  const archived = await lessonService.createLessonPurchase({
    studentId: archivedStudent!.id,
    quantity: 10,
  })
  assert(
    archived.success === false && archived.errorType === "STUDENT_ARCHIVED",
    "archived student"
  )
  console.log("✓ STUDENT_ARCHIVED")

  const list = await studentService.listActiveStudents()
  assert(list.success === true, "list students")
  if (list.success) {
    const row = list.data.find((s) => s.id === studentId)
    assert(row != null && row.lessonBalance === 15, "list lessonBalance 15")
  }
  console.log("✓ listActiveStudents real lessonBalance")

  const detail = await studentService.getStudentDetail(studentId)
  assert(detail.success === true, "get detail")
  if (detail.success) {
    assert(detail.data.lessonBalance === 15, "detail lessonBalance 15")
  }
  console.log("✓ getStudentDetail real lessonBalance")

  const actionPurchase = await createLessonPurchaseAction({
    studentId,
    quantity: 1,
  })
  assert(actionPurchase.success === true, "action layer")
  if (actionPurchase.success) {
    assert(actionPurchase.data.lessonBalance === 16, "action balance 16")
  }
  console.log("✓ createLessonPurchaseAction")

  const listAction = await listStudentsAction()
  if (listAction.success) {
    const row = listAction.data.find((s) => s.id === studentId)
    assert(row?.lessonBalance === 16, "listStudentsAction balance")
  }
  console.log("✓ listStudentsAction")

  const detailAction = await getStudentAction(studentId)
  if (detailAction.success) {
    assert(detailAction.data.lessonBalance === 16, "getStudentAction balance")
  }
  console.log("✓ getStudentAction")

  await cleanup()
  console.log("\nAll M2 lesson service tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM2 lesson test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
