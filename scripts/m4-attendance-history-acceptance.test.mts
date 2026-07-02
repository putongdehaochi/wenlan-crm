/**
 * @file m4-attendance-history-acceptance.test.mts
 * @feature attendance
 * @purpose M4 验收：PostgreSQL → Repository → Service → Action 全链路
 *
 * 覆盖 specs/attendance-history.md §7 全部场景 + Sprint 2～4 回归
 *
 * 运行：npm run test:m4-attendance-history
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { checkInStudentAction } from "../src/features/attendance/actions/check-in-student.action"
import { listAttendanceHistoryAction } from "../src/features/attendance/actions/list-attendance-history.action"
import { listTodayAttendanceAction } from "../src/features/attendance/actions/list-today-attendance.action"
import { voidAttendanceAction } from "../src/features/attendance/actions/void-attendance.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { lessonBalanceRepository } from "../src/features/lessons/repositories/lesson-balance.repository"
import { createLessonPurchaseAction } from "../src/features/lessons/actions/create-lesson-purchase.action"
import { createStudentAction } from "../src/features/students/actions/create-student.action"
import { getStudentAction } from "../src/features/students/actions/get-student.action"
import { listStudentsAction } from "../src/features/students/actions/list-students.action"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m4_att_history__"
const DAY_1 = toAttendanceDate(new Date("2026-06-01"))
const DAY_3 = toAttendanceDate(new Date("2026-06-03"))
const DAY_5 = toAttendanceDate(new Date("2026-06-05"))
const TODAY = toAttendanceDate()

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

async function cleanup(): Promise<void> {
  await prisma.attendance.deleteMany({
    where: { student: { name: { startsWith: TEST_PREFIX } } },
  })
  await prisma.lessonPackage.deleteMany({
    where: { student: { name: { startsWith: TEST_PREFIX } } },
  })
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

async function createStudentWithBalance(name: string, quantity: number) {
  const created = await createStudentAction({
    name: `${TEST_PREFIX}${name}`,
    contactName: "家长",
  })
  assert(created.success === true, `create student ${name}`)
  if (!created.success) throw new Error("setup failed")

  if (quantity > 0) {
    const purchase = await createLessonPurchaseAction({
      studentId: created.data.id,
      quantity,
    })
    assert(purchase.success === true, `purchase ${quantity} for ${name}`)
  }

  return created.data.id
}

function assertUiLayerCompliance(): void {
  const historyPage = readFileSync(
    join(
      process.cwd(),
      "src/features/attendance/components/attendance-history-page.tsx"
    ),
    "utf8"
  )
  assert(
    historyPage.includes("listAttendanceHistoryAction"),
    "history page uses list action"
  )
  assert(
    historyPage.includes("voidAttendanceAction"),
    "history page uses void action"
  )
  assert(!/import.*attendanceService/.test(historyPage), "history page no Service")
  assert(!/import.*repository/i.test(historyPage), "history page no Repository")

  const historyRow = readFileSync(
    join(
      process.cwd(),
      "src/features/attendance/components/attendance-history-row.tsx"
    ),
    "utf8"
  )
  assert(historyRow.includes("canVoid"), "history row uses canVoid from ViewModel")
  assert(!/import.*Action/.test(historyRow), "history row no Action import")
  assert(!/import.*Service/.test(historyRow), "history row no Service import")
  assert(!/import.*repository/i.test(historyRow), "history row no Repository")

  const historyList = readFileSync(
    join(
      process.cwd(),
      "src/features/attendance/components/attendance-history-list.tsx"
    ),
    "utf8"
  )
  assert(!/import.*Action/.test(historyList), "history list no Action import")

  const dialog = readFileSync(
    join(
      process.cwd(),
      "src/features/attendance/components/void-attendance-dialog.tsx"
    ),
    "utf8"
  )
  assert(!/import.*Action/.test(dialog), "dialog no Action import")
  assert(!/import.*Service/.test(dialog), "dialog no Service import")
}

function assertArchitectureRegression(): void {
  const studentService = readFileSync(
    join(process.cwd(), "src/features/students/services/student.service.ts"),
    "utf8"
  )
  assert(
    !studentService.includes("attendanceRepository"),
    "student.service no attendanceRepository"
  )
  assert(
    !studentService.includes("attendanceService"),
    "student.service no attendanceService"
  )
  assert(
    !studentService.includes("findByIds"),
    "student.service no findByIds"
  )

  const lessonBalance = readFileSync(
    join(
      process.cwd(),
      "src/features/lessons/repositories/lesson-balance.repository.ts"
    ),
    "utf8"
  )
  assert(
    lessonBalance.includes("getBalance"),
    "lesson-balance.repository getBalance preserved"
  )
  assert(
    lessonBalance.includes("getBalances"),
    "lesson-balance.repository getBalances preserved"
  )
  assert(
    !lessonBalance.includes("void"),
    "lesson-balance.repository no void"
  )
}

async function runAcceptance(): Promise<void> {
  console.log("M4 Attendance History Acceptance — full chain test\n")
  await cleanup()

  // §7.1 H1 — 小明 3 条 VALID，倒序含 studentName
  const xiaomingId = await createStudentWithBalance("小明", 10)
  await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_1,
  })
  await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_3,
  })
  await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_5,
  })

  const h1 = await listAttendanceHistoryAction()
  assert(h1.success === true, "H1 success")
  if (h1.success) {
    const xiaomingRows = h1.data.filter((r) => r.studentId === xiaomingId)
    assert(xiaomingRows.length === 3, "H1 three records")
    assert(xiaomingRows[0]!.attendanceDate === "2026-06-05", "H1 desc 6/5")
    assert(xiaomingRows[1]!.attendanceDate === "2026-06-03", "H1 desc 6/3")
    assert(xiaomingRows[2]!.attendanceDate === "2026-06-01", "H1 desc 6/1")
    assert(xiaomingRows[0]!.studentName.includes("小明"), "H1 studentName")
  }
  console.log("✓ §7.1 H1 历史倒序 + studentName")

  // §7.1 H2 — studentId 筛选
  const h2 = await listAttendanceHistoryAction({ studentId: xiaomingId })
  assert(h2.success === true && h2.data.length === 3, "H2 filter")
  console.log("✓ §7.1 H2 studentId 筛选")

  // §7.1 H3 — 多学员姓名正确
  const xiaohongId = await createStudentWithBalance("小红", 5)
  await attendanceRepository.create({
    studentId: xiaohongId,
    attendanceDate: DAY_3,
  })

  const h3 = await listAttendanceHistoryAction()
  assert(h3.success === true, "H3 success")
  if (h3.success) {
    const ming = h3.data.find((r) => r.studentId === xiaomingId)
    const hong = h3.data.find((r) => r.studentId === xiaohongId)
    assert(ming?.studentName.includes("小明"), "H3 ming name")
    assert(hong?.studentName.includes("小红"), "H3 hong name")
    assert(h3.data.filter((r) => r.studentId === xiaomingId).length === 3, "H3 ming 3")
    assert(h3.data.filter((r) => r.studentId === xiaohongId).length === 1, "H3 hong 1")
  }
  console.log("✓ §7.1 H3 多学员姓名")

  // §7.1 H4 — 无签到空列表（独立学员）
  await cleanup()
  const h4 = await listAttendanceHistoryAction()
  assert(
    h4.success === true && h4.data.filter((r) => r.studentName.startsWith(TEST_PREFIX)).length === 0,
    "H4 empty for test prefix"
  )
  console.log("✓ §7.1 H4 无签到空列表")

  // §7.1 H5 — 无效 studentId
  const h5 = await listAttendanceHistoryAction({
    studentId: "nonexistent-cuid-id",
  })
  assert(
    h5.success === false && h5.errorType === "STUDENT_NOT_FOUND",
    "H5 STUDENT_NOT_FOUND"
  )
  console.log("✓ §7.1 H5 无效 studentId")

  // §7.1 H6 — 归档学员历史仍可查
  const archivedId = await createStudentWithBalance("归档学员", 8)
  await attendanceRepository.create({
    studentId: archivedId,
    attendanceDate: DAY_1,
  })
  await attendanceRepository.create({
    studentId: archivedId,
    attendanceDate: DAY_3,
  })
  await prisma.student.update({
    where: { id: archivedId },
    data: { status: "ARCHIVED" },
  })
  const h6 = await listAttendanceHistoryAction({ studentId: archivedId })
  assert(h6.success === true && h6.data.length === 2, "H6 archived history")
  console.log("✓ §7.1 H6 归档学员历史")

  // §7.2 U1 — 余额 7，撤销今日 VALID → 余额 8
  await cleanup()
  const u1Student = await createStudentWithBalance("撤销小明", 10)
  await attendanceRepository.create({
    studentId: u1Student,
    attendanceDate: DAY_1,
  })
  await attendanceRepository.create({
    studentId: u1Student,
    attendanceDate: DAY_3,
  })
  const todayRecord = await attendanceRepository.create({
    studentId: u1Student,
    attendanceDate: TODAY,
  })
  const balanceBefore = await lessonBalanceRepository.getBalance(u1Student)
  assert(balanceBefore === 7, "U1 balance before 7")

  const u1 = await voidAttendanceAction({ attendanceId: todayRecord.id })
  assert(u1.success === true, "U1 void success")
  if (u1.success) {
    assert(u1.data.status === "VOIDED", "U1 VOIDED")
    assert(u1.data.lessonBalance === 8, "U1 balance after 8")
  }
  console.log("✓ §7.2 U1 VALID→VOIDED，余额 7→8")

  // §7.2 U2 — ALREADY_VOIDED
  const u2 = await voidAttendanceAction({ attendanceId: todayRecord.id })
  assert(
    u2.success === false && u2.errorType === "ALREADY_VOIDED",
    "U2 ALREADY_VOIDED"
  )
  const balanceAfterDup = await lessonBalanceRepository.getBalance(u1Student)
  assert(balanceAfterDup === 8, "U2 balance unchanged")
  console.log("✓ §7.2 U2 重复撤销")

  // §7.2 U3 — ATTENDANCE_NOT_FOUND
  const u3 = await voidAttendanceAction({ attendanceId: "nonexistent-cuid-id" })
  assert(
    u3.success === false && u3.errorType === "ATTENDANCE_NOT_FOUND",
    "U3 NOT_FOUND"
  )
  console.log("✓ §7.2 U3 不存在记录")

  // §7.2 U4 — 历史列表 VOIDED + canVoid=false
  const u4 = await listAttendanceHistoryAction({ studentId: u1Student })
  assert(u4.success === true, "U4 success")
  if (u4.success) {
    const voidedRow = u4.data.find((r) => r.id === todayRecord.id)
    assert(voidedRow?.status === "VOIDED", "U4 VOIDED status")
    assert(voidedRow?.canVoid === false, "U4 canVoid false")
  }
  console.log("✓ §7.2 U4 History VOIDED + canVoid=false")

  // §7.2 U5 — 撤销今日签到后 Today List 显示已撤销，需恢复而非重新签到
  const u5 = await listTodayAttendanceAction({ attendanceDate: TODAY })
  assert(u5.success === true, "U5 today list")
  if (u5.success) {
    const row = u5.data.find((r) => r.id === u1Student)
    assert(row?.todayStatus === "VOIDED", "U5 voided today status")
    assert(row?.canCheckIn === false, "U5 cannot check in again")
    assert(row?.canRestore === true, "U5 can restore")
    assert(row?.lessonBalance === 8, "U5 balance 8 on today list")
  }

  const u5Retry = await checkInStudentAction({
    studentId: u1Student,
    attendanceDate: TODAY,
  })
  assert(
    u5Retry.success === false && u5Retry.errorType === "VOIDED_TODAY",
    "U5 voided retry check-in"
  )
  console.log("✓ §7.2 U5 撤销后 Today List")

  // M4 #6 — 三处余额一致（Student / Today / VoidResult）
  const studentList = await listStudentsAction()
  const studentDetail = await getStudentAction(u1Student)
  assert(studentList.success && studentDetail.success, "student actions")
  if (studentList.success && studentDetail.success) {
    const listRow = studentList.data.find((s) => s.id === u1Student)
    assert(listRow?.lessonBalance === 8, "balance student list 8")
    assert(studentDetail.data.lessonBalance === 8, "balance student detail 8")
  }
  if (u5.success) {
    const todayRow = u5.data.find((r) => r.id === u1Student)
    assert(todayRow?.lessonBalance === 8, "balance today 8")
  }
  console.log("✓ M4 #6 Student / Today / History 余额一致")

  // §7.3 R1 — Sprint 4 签到流程仍成功（独立学员）
  const r1Student = await createStudentWithBalance("签到回归", 5)
  const r1CheckIn = await checkInStudentAction({
    studentId: r1Student,
    attendanceDate: TODAY,
  })
  assert(r1CheckIn.success === true, "R1 check-in success")
  if (r1CheckIn.success) {
    assert(r1CheckIn.data.lessonBalance === 4, "R1 balance 4 after check-in")
    assert(r1CheckIn.data.todayStatus === "CHECKED_IN", "R1 checked in")
  }
  console.log("✓ §7.3 R1 Sprint 4 签到回归")

  // §7.3 R2 — listStudents 余额与公式一致
  const r2 = await listStudentsAction()
  if (r2.success) {
    const row = r2.data.find((s) => s.id === u1Student)
    assert(row?.lessonBalance === 8, "R2 formula consistent (10 - 2 VALID)")
  }
  console.log("✓ §7.3 R2 Student 余额公式")

  // §7.3 R3 — UI 分层审计
  assertUiLayerCompliance()
  console.log("✓ §7.3 R3 UI Import 审计")

  assertArchitectureRegression()
  console.log("✓ Architecture Regression Audit")

  await cleanup()
  console.log("\nAll M4 attendance history acceptance tests passed.")
}

runAcceptance()
  .catch((error) => {
    console.error("\nM4 attendance history acceptance failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
