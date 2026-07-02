/**
 * @file m4-lesson-acceptance.test.mts
 * @feature lessons
 * @purpose M4 验收：PostgreSQL → Repository → Service → Action 全链路
 *
 * 覆盖 specs/lesson.md §5.3 全部 8 条 + Student/Lesson 回归
 *
 * 运行：npm run test:m4-lesson
 */

import "dotenv/config"

import { createLessonPurchaseAction } from "../src/features/lessons/actions/create-lesson-purchase.action"
import { lessonPackageRepository } from "../src/features/lessons/repositories/lesson-package.repository"
import { createStudentAction } from "../src/features/students/actions/create-student.action"
import { getStudentAction } from "../src/features/students/actions/get-student.action"
import { listStudentsAction } from "../src/features/students/actions/list-students.action"
import { prisma } from "../src/shared/lib/db"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const TEST_PREFIX = "__m4_lesson__"

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

function assertUiLayerCompliance(): void {
  const purchaseForm = readFileSync(
    join(
      process.cwd(),
      "src/features/lessons/components/create-lesson-purchase-form.tsx"
    ),
    "utf8"
  )
  assert(
    purchaseForm.includes("createLessonPurchaseAction"),
    "purchase form uses Action"
  )
  assert(!/import.*lessonService/.test(purchaseForm), "purchase form no Service")
  assert(!/import.*repository/i.test(purchaseForm), "purchase form no Repository")

  const detailView = readFileSync(
    join(
      process.cwd(),
      "src/features/students/components/student-detail-view.tsx"
    ),
    "utf8"
  )
  assert(detailView.includes("录入课时"), "detail has purchase entry")
  assert(!detailView.includes("lessonService"), "detail no Service")
}

async function createTestStudent(name: string, contactName: string) {
  const result = await createStudentAction({
    name: `${TEST_PREFIX}${name}`,
    contactName,
  })
  assert(result.success === true, `create student ${name}`)
  return result.success ? result.data : null
}

async function runAcceptance(): Promise<void> {
  console.log("M4 Lesson Acceptance — full chain test\n")
  await cleanup()

  // §5.3 #1 — 小明余额 0 → 录入 10 → 列表与详情均为 10
  const xiaoming = await createTestStudent("小明", "明妈")
  assert(xiaoming != null, "xiaoming created")
  const purchase10 = await createLessonPurchaseAction({
    studentId: xiaoming!.id,
    quantity: 10,
  })
  assert(purchase10.success === true, "purchase 10")
  if (purchase10.success) {
    assert(purchase10.data.lessonBalance === 10, "purchase result balance 10")
  }

  const list1 = await listStudentsAction()
  assert(list1.success === true, "list after purchase")
  if (list1.success) {
    const row = list1.data.find((s) => s.id === xiaoming!.id)
    assert(row?.lessonBalance === 10, "list balance 10")
  }

  const detail1 = await getStudentAction(xiaoming!.id)
  assert(detail1.success === true, "detail after purchase")
  if (detail1.success) {
    assert(detail1.data.lessonBalance === 10, "detail balance 10")
    assert(
      list1.success &&
        list1.data.find((s) => s.id === xiaoming!.id)?.lessonBalance ===
          detail1.data.lessonBalance,
      "list and detail balance match"
    )
  }
  console.log("✓ §5.3 #1 小明 0→10，列表与详情一致")

  // §5.3 #2 — 小红余额 2 → 再录 20 → 22
  const xiaohong = await createTestStudent("小红", "红爸")
  assert(xiaohong != null, "xiaohong created")
  await createLessonPurchaseAction({ studentId: xiaohong!.id, quantity: 2 })
  const renew = await createLessonPurchaseAction({
    studentId: xiaohong!.id,
    quantity: 20,
  })
  assert(renew.success === true, "renew 20")
  const detailHong = await getStudentAction(xiaohong!.id)
  if (detailHong.success) {
    assert(detailHong.data.lessonBalance === 22, "balance 22")
  }
  console.log("✓ §5.3 #2 小红 2→22")

  // §5.3 #3 — 先 10 再 5，余额 15，两条购课记录
  const xiaoming2 = await createTestStudent("小明续", "明妈")
  assert(xiaoming2 != null, "xiaoming2 created")
  await createLessonPurchaseAction({ studentId: xiaoming2!.id, quantity: 10 })
  await createLessonPurchaseAction({ studentId: xiaoming2!.id, quantity: 5 })
  const packages = await lessonPackageRepository.findByStudentId(xiaoming2!.id)
  assert(packages.length === 2, "two purchase records")
  const detail3 = await getStudentAction(xiaoming2!.id)
  if (detail3.success) {
    assert(detail3.data.lessonBalance === 15, "balance 15")
  }
  console.log("✓ §5.3 #3 连续购课 10+5=15，两条记录")

  // §5.3 #4 — 不存在 studentId
  const notFound = await createLessonPurchaseAction({
    studentId: "nonexistent-cuid-id",
    quantity: 10,
  })
  assert(
    notFound.success === false && notFound.errorType === "STUDENT_NOT_FOUND",
    "STUDENT_NOT_FOUND"
  )
  console.log("✓ §5.3 #4 STUDENT_NOT_FOUND")

  // §5.3 #5 — 课时数 0
  const beforeZero = await getStudentAction(xiaoming!.id)
  const zeroQty = await createLessonPurchaseAction({
    studentId: xiaoming!.id,
    quantity: 0,
  })
  assert(
    zeroQty.success === false && zeroQty.errorType === "VALIDATION_ERROR",
    "quantity 0 rejected"
  )
  const afterZero = await getStudentAction(xiaoming!.id)
  if (beforeZero.success && afterZero.success) {
    assert(
      afterZero.data.lessonBalance === beforeZero.data.lessonBalance,
      "balance unchanged after 0"
    )
  }
  console.log("✓ §5.3 #5 quantity 0 validation")

  // §5.3 #6 — 负数
  const negQty = await createLessonPurchaseAction({
    studentId: xiaoming!.id,
    quantity: -5,
  })
  assert(
    negQty.success === false && negQty.errorType === "VALIDATION_ERROR",
    "negative quantity rejected"
  )
  console.log("✓ §5.3 #6 negative quantity validation")

  // §5.3 #7 — 已归档学员（实现 errorType: STUDENT_ARCHIVED）
  const archived = await prisma.student.create({
    data: {
      name: `${TEST_PREFIX}归档`,
      contactName: "归档妈",
      status: "ARCHIVED",
    },
  })
  const archivedPurchase = await createLessonPurchaseAction({
    studentId: archived.id,
    quantity: 10,
  })
  assert(
    archivedPurchase.success === false &&
      archivedPurchase.errorType === "STUDENT_ARCHIVED",
    "STUDENT_ARCHIVED"
  )
  console.log("✓ §5.3 #7 STUDENT_ARCHIVED")

  // §5.3 #8 — 多名学员各有购课，列表余额正确（批量 getBalances）
  const studentA = await createTestStudent("学员A", "家长A")
  const studentB = await createTestStudent("学员B", "家长B")
  assert(studentA != null && studentB != null, "multi students")
  await createLessonPurchaseAction({ studentId: studentA!.id, quantity: 7 })
  await createLessonPurchaseAction({ studentId: studentB!.id, quantity: 3 })

  const multiList = await listStudentsAction()
  assert(multiList.success === true, "multi list")
  if (multiList.success) {
    const rowA = multiList.data.find((s) => s.id === studentA!.id)
    const rowB = multiList.data.find((s) => s.id === studentB!.id)
    assert(rowA?.lessonBalance === 7, "student A balance 7")
    assert(rowB?.lessonBalance === 3, "student B balance 3")
  }
  console.log("✓ §5.3 #8 multi-student list balances")

  // 附加：100 节大量课时
  const big = await createTestStudent("大量", "家长")
  const bigPurchase = await createLessonPurchaseAction({
    studentId: big!.id,
    quantity: 100,
  })
  assert(bigPurchase.success === true, "purchase 100")
  if (bigPurchase.success) {
    assert(bigPurchase.data.lessonBalance === 100, "balance 100")
  }
  console.log("✓ §5.1 大量课时 100")

  // 附加：最小 1 节
  const min = await createTestStudent("最小", "家长")
  const minPurchase = await createLessonPurchaseAction({
    studentId: min!.id,
    quantity: 1,
  })
  assert(minPurchase.success === true, "purchase 1")
  if (minPurchase.success) {
    assert(minPurchase.data.lessonBalance === 1, "balance 1")
  }
  console.log("✓ §5.1 最小课时 1")

  assertUiLayerCompliance()
  console.log("✓ UI layer compliance audit")

  await cleanup()
  console.log("\nAll M4 lesson acceptance tests passed.")
}

runAcceptance()
  .catch((error) => {
    console.error("\nM4 lesson acceptance failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
