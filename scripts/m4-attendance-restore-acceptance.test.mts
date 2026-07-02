/**
 * @file m4-attendance-restore-acceptance.test.mts
 * @feature attendance
 * @purpose M4 验收：PostgreSQL → Repository → Service → Action 全链路
 *
 * 覆盖 specs/attendance-restore.md §5 全部场景 + Restore Regression Checklist + Sprint 2～5 回归
 *
 * 运行：npm run test:m4-attendance-restore
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { checkInStudentAction } from "../src/features/attendance/actions/check-in-student.action"
import { listAttendanceHistoryAction } from "../src/features/attendance/actions/list-attendance-history.action"
import { listTodayAttendanceAction } from "../src/features/attendance/actions/list-today-attendance.action"
import { restoreAttendanceAction } from "../src/features/attendance/actions/restore-attendance.action"
import { voidAttendanceAction } from "../src/features/attendance/actions/void-attendance.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { createLessonPurchaseAction } from "../src/features/lessons/actions/create-lesson-purchase.action"
import { lessonBalanceRepository } from "../src/features/lessons/repositories/lesson-balance.repository"
import { createStudentAction } from "../src/features/students/actions/create-student.action"
import { getStudentAction } from "../src/features/students/actions/get-student.action"
import { listStudentsAction } from "../src/features/students/actions/list-students.action"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m4_att_restore__"
const DAY_1 = toAttendanceDate(new Date("2026-06-01"))
const DAY_3 = toAttendanceDate(new Date("2026-06-03"))
const DAY_5 = toAttendanceDate(new Date("2026-06-05"))

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
    historyPage.includes("restoreAttendanceAction"),
    "history page uses restore action"
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
  assert(historyRow.includes("canVoid"), "history row uses canVoid")
  assert(historyRow.includes("canRestore"), "history row uses canRestore")
  assert(!/status === "VOIDED"/.test(historyRow), "history row no status business rule")
  assert(!/import.*Action/.test(historyRow), "history row no Action import")

  const restoreDialog = readFileSync(
    join(
      process.cwd(),
      "src/features/attendance/components/restore-attendance-dialog.tsx"
    ),
    "utf8"
  )
  assert(!/import.*Action/.test(restoreDialog), "restore dialog no Action import")
  assert(!/import.*Service/.test(restoreDialog), "restore dialog no Service import")

  const filter = readFileSync(
    join(
      process.cwd(),
      "src/features/attendance/components/attendance-history-filter.tsx"
    ),
    "utf8"
  )
  assert(
    filter.includes("buildAttendanceHistoryHref"),
    "filter uses URL query helper"
  )
  assert(!/import.*Action/.test(filter), "filter no Action import")
  assert(!/listAttendanceHistoryAction/.test(filter), "filter no list action")
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

  const lessonBalance = readFileSync(
    join(
      process.cwd(),
      "src/features/lessons/repositories/lesson-balance.repository.ts"
    ),
    "utf8"
  )
  assert(lessonBalance.includes("getBalance"), "lesson-balance getBalance preserved")
  assert(lessonBalance.includes("getBalances"), "lesson-balance getBalances preserved")
  assert(!lessonBalance.includes("restore"), "lesson-balance no restore")
}

async function runAcceptance(): Promise<void> {
  console.log("M4 Attendance Restore Acceptance — full chain test\n")
  await cleanup()

  const xiaomingId = await createStudentWithBalance("小明", 10)
  await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_1,
  })
  await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_3,
  })
  const record3 = await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_5,
  })

  const voidSetup = await voidAttendanceAction({ attendanceId: record3.id })
  assert(voidSetup.success === true, "setup void record3")
  const balanceBeforeRestore = await lessonBalanceRepository.getBalance(xiaomingId)
  assert(balanceBeforeRestore === 8, "setup balance 8")

  // §5.1 RS1 — 余额 8，VOIDED → VALID，余额 7
  const rs1 = await restoreAttendanceAction({ attendanceId: record3.id })
  assert(rs1.success === true, "RS1 success")
  if (rs1.success) {
    assert(rs1.data.status === "VALID", "RS1 VALID")
    assert(rs1.data.lessonBalance === 7, "RS1 balance 7")
    assert(typeof rs1.data.checkedInAt === "string", "RS1 checkedInAt preserved")
  }
  console.log("✓ §5.1 RS1 Restore 成功（余额 8→7）")

  // §5.1 RS2 — ALREADY_VALID
  const rs2 = await restoreAttendanceAction({ attendanceId: record3.id })
  assert(
    rs2.success === false && rs2.errorType === "ALREADY_VALID",
    "RS2 ALREADY_VALID"
  )
  console.log("✓ §5.1 RS2 ALREADY_VALID")

  // §5.1 RS3 — ATTENDANCE_NOT_FOUND
  const rs3 = await restoreAttendanceAction({
    attendanceId: "nonexistent-cuid-id",
  })
  assert(
    rs3.success === false && rs3.errorType === "ATTENDANCE_NOT_FOUND",
    "RS3 NOT_FOUND"
  )
  console.log("✓ §5.1 RS3 ATTENDANCE_NOT_FOUND")

  // §5.2 HF1 — dateFrom/dateTo（RS4 前，仅小明 3 条）
  const hf1 = await listAttendanceHistoryAction({
    dateFrom: "2026-06-03",
    dateTo: "2026-06-05",
  })
  assert(hf1.success === true && hf1.data.length === 2, "HF1 two records")
  console.log("✓ §5.2 HF1 日期筛选 2 条")

  // §5.2 HF2 — studentId + 日期
  const hf2 = await listAttendanceHistoryAction({
    studentId: xiaomingId,
    dateFrom: "2026-06-03",
    dateTo: "2026-06-05",
  })
  assert(hf2.success === true && hf2.data.length === 2, "HF2 combined filter")
  console.log("✓ §5.2 HF2 studentId + 日期")

  // §5.2 HF4 — dateFrom > dateTo
  const hf4 = await listAttendanceHistoryAction({
    dateFrom: "2026-06-05",
    dateTo: "2026-06-03",
  })
  assert(
    hf4.success === false && hf4.errorType === "VALIDATION_ERROR",
    "HF4 VALIDATION_ERROR"
  )
  console.log("✓ §5.2 HF4 日期范围无效")

  // Query Matrix
  const qmAll = await listAttendanceHistoryAction({
    dateFrom: "2026-06-01",
    dateTo: "2026-06-01",
  })
  assert(qmAll.success === true && qmAll.data.length === 1, "QM all students 6/1")
  const qmStudent = await listAttendanceHistoryAction({
    studentId: xiaomingId,
    dateFrom: "2026-06-01",
    dateTo: "2026-06-01",
  })
  assert(qmStudent.success === true && qmStudent.data.length === 1, "QM student 6/1")
  const qmNone = await listAttendanceHistoryAction({ studentId: xiaomingId })
  assert(qmNone.success === true && qmNone.data.length === 3, "QM student all dates")
  console.log("✓ Query Matrix（studentId × dateFrom × dateTo）")

  // §5.1 RS4 — INSUFFICIENT_BALANCE
  const zeroId = await createStudentWithBalance("零余额", 1)
  const zeroRecord = await attendanceRepository.create({
    studentId: zeroId,
    attendanceDate: DAY_1,
  })
  await voidAttendanceAction({ attendanceId: zeroRecord.id })
  await attendanceRepository.create({
    studentId: zeroId,
    attendanceDate: DAY_3,
  })
  const rs4 = await restoreAttendanceAction({ attendanceId: zeroRecord.id })
  assert(
    rs4.success === false && rs4.errorType === "INSUFFICIENT_BALANCE",
    "RS4 INSUFFICIENT_BALANCE"
  )
  console.log("✓ §5.1 RS4 INSUFFICIENT_BALANCE")

  // §5.1 RS5 — Restore 当日 → Today CHECKED_IN
  const today = toAttendanceDate()
  const todayStudentId = await createStudentWithBalance("今日", 5)
  const todayRecord = await attendanceRepository.create({
    studentId: todayStudentId,
    attendanceDate: today,
  })
  const originalCheckedInAt = (
    await attendanceRepository.findById(todayRecord.id)
  )?.createdAt.toISOString()
  await voidAttendanceAction({ attendanceId: todayRecord.id })

  const rs5 = await restoreAttendanceAction({ attendanceId: todayRecord.id })
  assert(rs5.success === true, "RS5 restore today")
  if (rs5.success && originalCheckedInAt) {
    assert(rs5.data.checkedInAt === originalCheckedInAt, "RS5 checkedInAt unchanged")
  }

  const todayList = await listTodayAttendanceAction({ attendanceDate: today })
  assert(todayList.success === true, "RS5 today list")
  if (todayList.success) {
    const row = todayList.data.find((r) => r.id === todayStudentId)
    assert(row?.todayStatus === "CHECKED_IN", "RS5 CHECKED_IN")
  }
  console.log("✓ §5.1 RS5 Restore 后 Today CHECKED_IN")

  // §5.1 RS6 — History canVoid / canRestore
  const rs6 = await listAttendanceHistoryAction({ studentId: xiaomingId })
  assert(rs6.success === true, "RS6 history")
  if (rs6.success) {
    const restored = rs6.data.find((r) => r.id === record3.id)
    assert(restored?.canVoid === true, "RS6 canVoid true")
    assert(restored?.canRestore === false, "RS6 canRestore false")
  }
  console.log("✓ §5.1 RS6 History ViewModel")

  // §5.2 HF3 — 无参数 Sprint 5 行为
  const hf3 = await listAttendanceHistoryAction()
  assert(hf3.success === true, "HF3 success")
  const testRows = hf3.data.filter((r) => r.studentName.startsWith(TEST_PREFIX))
  assert(testRows.length >= 5, "HF3 backward compatible list")
  console.log("✓ §5.2 HF3 无参数向后兼容")

  // Restore Regression Checklist — Restore → History → Today → Students → Balance
  assert(rs5.success === true, "checklist restore success")
  if (rs5.success) {
    const expectedBalance = rs5.data.lessonBalance
    const historyAfter = await listAttendanceHistoryAction({
      studentId: todayStudentId,
    })
    const studentList = await listStudentsAction()
    const studentDetail = await getStudentAction(todayStudentId)
    const todayAfter = await listTodayAttendanceAction({ attendanceDate: today })

    assert(historyAfter.success === true, "checklist history")
    if (historyAfter.success) {
      const row = historyAfter.data.find((r) => r.id === todayRecord.id)
      assert(row?.status === "VALID", "checklist history VALID")
      assert(row?.canVoid === true, "checklist history canVoid")
    }
    assert(studentList.success && studentDetail.success, "checklist students")
    if (studentList.success && studentDetail.success) {
      const listRow = studentList.data.find((s) => s.id === todayStudentId)
      assert(listRow?.lessonBalance === expectedBalance, "checklist student list balance")
      assert(
        studentDetail.data.lessonBalance === expectedBalance,
        "checklist student detail balance"
      )
    }
    if (todayAfter.success) {
      const todayRow = todayAfter.data.find((r) => r.id === todayStudentId)
      assert(todayRow?.lessonBalance === expectedBalance, "checklist today balance")
    }
    assert(rs5.data.lessonBalance === expectedBalance, "checklist restore result balance")
  }
  console.log("✓ Restore Regression Checklist（History / Today / Students / Balance）")

  // §5.3 R1 — voidAttendanceAction 不变
  const voidAgain = await voidAttendanceAction({ attendanceId: todayRecord.id })
  assert(voidAgain.success === true && voidAgain.data.status === "VOIDED", "R1 void")
  console.log("✓ §5.3 R1 voidAttendanceAction 回归")

  // §5.3 R2 — checkInStudentAction 不变
  const r2Student = await createStudentWithBalance("签到回归", 5)
  const r2CheckIn = await checkInStudentAction({
    studentId: r2Student,
    attendanceDate: today,
  })
  assert(r2CheckIn.success === true, "R2 check-in")
  if (r2CheckIn.success) {
    assert(r2CheckIn.data.lessonBalance === 4, "R2 balance after check-in")
  }
  console.log("✓ §5.3 R2 checkInStudentAction 回归")

  // §5.3 R3 — listStudents 余额公式
  const r3 = await listStudentsAction()
  if (r3.success) {
    const ming = r3.data.find((s) => s.id === xiaomingId)
    assert(ming?.lessonBalance === 7, "R3 xiaoming balance 7 (10 - 3 VALID)")
  }
  console.log("✓ §5.3 R3 listStudentsAction 余额一致")

  // §5.3 R4 — UI import 审计
  assertUiLayerCompliance()
  console.log("✓ §5.3 R4 UI Import 审计")

  assertArchitectureRegression()
  console.log("✓ Architecture Regression Audit")

  await cleanup()
  console.log("\nAll M4 attendance restore acceptance tests passed.")
}

runAcceptance()
  .catch((error) => {
    console.error("\nM4 attendance restore acceptance failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
