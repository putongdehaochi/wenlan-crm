/**
 * @file m4-student-acceptance.test.mts
 * @feature students
 * @purpose M4 验收：PostgreSQL → Repository → Service → Action 全链路
 *
 * 覆盖 specs/student.md §5.4 + Tech Lead M4 要求（非仅 Happy Path）
 *
 * 运行：npm run test:m4
 */

import "dotenv/config"

import { createStudentAction } from "../src/features/students/actions/create-student.action"
import { getStudentAction } from "../src/features/students/actions/get-student.action"
import { listStudentsAction } from "../src/features/students/actions/list-students.action"
import { prisma } from "../src/shared/lib/db"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const TEST_PREFIX = "__m4_accept__"

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

async function cleanup(): Promise<void> {
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

function assertReadOnlyDetailUi(): void {
  const source = readFileSync(
    join(process.cwd(), "src/features/students/components/student-detail-view.tsx"),
    "utf8"
  )
  assert(!source.includes("edit"), "StudentDetailView has no edit entry")
  assert(!source.includes("保存"), "StudentDetailView has no save control")
  assert(!source.includes("<Input"), "StudentDetailView has no form inputs")
}

async function runAcceptance(): Promise<void> {
  console.log("M4 Student Acceptance — full chain test\n")
  await cleanup()

  // §5.4 #1 + 空列表 + lessonBalance 默认值
  const emptyList = await listStudentsAction()
  assert(emptyList.success === true, "list action succeeds")
  if (emptyList.success) {
    const testRows = emptyList.data.filter((s) => s.name.startsWith(TEST_PREFIX))
    assert(testRows.length === 0, "empty roster for test prefix")
  }
  console.log("✓ §5.4 empty list")

  const first = await createStudentAction({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
    phone: "13800000001",
  })
  assert(first.success === true, "create 小明/明妈 success")
  if (first.success) {
    assert(first.data.lessonBalance === 0, "create detail lessonBalance 0")
    assert(first.data.status === "ACTIVE", "create status ACTIVE")
  }

  const afterFirst = await listStudentsAction()
  assert(afterFirst.success === true, "list after first create")
  if (afterFirst.success) {
    const rows = afterFirst.data.filter((s) => s.name.startsWith(TEST_PREFIX))
    assert(rows.length === 1, "list has 1 test student")
    assert(rows[0]?.lessonBalance === 0, "list lessonBalance 0")
  }
  console.log("✓ §5.4 #1 create 小明/明妈 → list 1, lessonBalance 0")

  // §5.4 #2 重复学生
  const dup = await createStudentAction({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
  })
  assert(
    dup.success === false && dup.errorType === "DUPLICATE_STUDENT",
    "duplicate name+contact rejected"
  )
  console.log("✓ §5.4 #2 duplicate student")

  // §5.4 #3 同名不同联系人
  const zhangActive = await createStudentAction({
    name: `${TEST_PREFIX}张伟`,
    contactName: "张妈",
  })
  assert(zhangActive.success === true, "create 张伟/张妈")

  const zhangOther = await createStudentAction({
    name: `${TEST_PREFIX}张伟`,
    contactName: "李妈",
  })
  assert(zhangOther.success === true, "create 张伟/李妈")

  const afterZhang = await listStudentsAction()
  if (afterZhang.success) {
    const zhangRows = afterZhang.data.filter(
      (s) => s.name === `${TEST_PREFIX}张伟`
    )
    assert(zhangRows.length === 2, "two 张伟 with different contacts")
  }
  console.log("✓ §5.4 #3 same name different contact")

  // §5.4 #4 查看详情（只读）
  if (first.success) {
    const detail = await getStudentAction(first.data.id)
    assert(detail.success === true, "get detail success")
    if (detail.success) {
      assert(detail.data.name === `${TEST_PREFIX}小明`, "detail name")
      assert(detail.data.contactName === "明妈", "detail contactName")
      assert(detail.data.lessonBalance === 0, "detail lessonBalance 0")
    }
  }
  assertReadOnlyDetailUi()
  console.log("✓ §5.4 #4 view detail read-only")

  // §5.4 #5 联系人为空
  const noContact = await createStudentAction({
    name: `${TEST_PREFIX}测试`,
    contactName: "",
  })
  assert(
    noContact.success === false && noContact.errorType === "VALIDATION_ERROR",
    "empty contact rejected"
  )
  console.log("✓ §5.4 #5 empty contact validation")

  // §5.4 #6 电话留空
  const noPhone = await createStudentAction({
    name: `${TEST_PREFIX}小红`,
    contactName: "红爸",
  })
  assert(noPhone.success === true, "create without phone")
  if (noPhone.success) {
    assert(noPhone.data.phone === null, "phone is null")
  }
  console.log("✓ §5.4 #6 create without phone")

  // §5.4 #7 共用电话
  const sharedPhone = "13900000099"
  const studentA = await createStudentAction({
    name: `${TEST_PREFIX}学员A`,
    contactName: "家长A",
    phone: sharedPhone,
  })
  const studentB = await createStudentAction({
    name: `${TEST_PREFIX}学员B`,
    contactName: "家长B",
    phone: sharedPhone,
  })
  assert(studentA.success === true && studentB.success === true, "shared phone")
  console.log("✓ §5.4 #7 shared phone")

  // Tech Lead：不存在学生
  const notFound = await getStudentAction("nonexistent-cuid-id")
  assert(
    notFound.success === false && notFound.errorType === "STUDENT_NOT_FOUND",
    "student not found"
  )
  console.log("✓ getStudent STUDENT_NOT_FOUND")

  // Tech Lead：已归档学员重复登记（§5.1 1.2）
  await prisma.student.create({
    data: {
      name: `${TEST_PREFIX}归档`,
      contactName: "归档妈",
      status: "ARCHIVED",
    },
  })
  const archivedDup = await createStudentAction({
    name: `${TEST_PREFIX}归档`,
    contactName: "归档妈",
  })
  assert(
    archivedDup.success === false &&
      archivedDup.errorType === "DUPLICATE_STUDENT",
    "archived duplicate rejected"
  )
  console.log("✓ archived student duplicate rejected")

  // 字段校验：姓名为空
  const noName = await createStudentAction({
    name: "   ",
    contactName: "家长",
  })
  assert(
    noName.success === false && noName.errorType === "VALIDATION_ERROR",
    "empty name rejected"
  )
  console.log("✓ empty name validation")

  await cleanup()
  console.log("\nAll M4 acceptance tests passed.")
}

runAcceptance()
  .catch((error) => {
    console.error("\nM4 acceptance failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
