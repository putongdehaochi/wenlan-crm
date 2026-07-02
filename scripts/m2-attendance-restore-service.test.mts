/**
 * @file m2-attendance-restore-service.test.mts
 * @feature attendance
 * @purpose Sprint 6 M2：restoreAttendance + History date filter + 审计
 *
 * 运行：npm run test:m2-attendance-restore
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { restoreAttendanceAction } from "../src/features/attendance/actions/restore-attendance.action"
import { listAttendanceHistoryAction } from "../src/features/attendance/actions/list-attendance-history.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { attendanceService } from "../src/features/attendance/services/attendance.service"
import { lessonBalanceRepository } from "../src/features/lessons/repositories/lesson-balance.repository"
import { lessonPackageRepository } from "../src/features/lessons/repositories/lesson-package.repository"
import { studentService } from "../src/features/students/services/student.service"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m2_att_restore__"
const DAY_1 = toAttendanceDate(new Date("2026-06-01"))
const DAY_3 = toAttendanceDate(new Date("2026-06-03"))
const DAY_5 = toAttendanceDate(new Date("2026-06-05"))

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

function auditSource(filePath: string, forbiddenPatterns: RegExp[]): void {
  const source = readFileSync(join(process.cwd(), filePath), "utf8")
  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(source), `${filePath} must not match ${pattern}`)
  }
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

async function setupStudent(name: string, quantity: number) {
  const created = await studentService.createStudent({
    name: `${TEST_PREFIX}${name}`,
    contactName: "家长",
  })
  assert(created.success === true, `create ${name}`)
  if (!created.success) throw new Error("setup failed")
  await lessonPackageRepository.create({
    studentId: created.data.id,
    quantity,
    note: null,
  })
  return created.data.id
}

async function runTests(): Promise<void> {
  console.log("M2 Attendance Restore Service — self test\n")
  await cleanup()

  const xiaomingId = await setupStudent("小明", 10)
  const zeroBalanceId = await setupStudent("零余额", 1)

  const record1 = await attendanceRepository.create({
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

  // Void record3 for restore tests (balance 7 → 8)
  const voided = await attendanceService.voidAttendance({
    attendanceId: record3.id,
  })
  assert(voided.success === true, "setup void")
  const balanceAfterVoid = await lessonBalanceRepository.getBalance(xiaomingId)
  assert(balanceAfterVoid === 8, "balance 8 after void")

  // RS1 — restore VOIDED, balance 8 → 7
  const restoreResult = await attendanceService.restoreAttendance({
    attendanceId: record3.id,
  })
  assert(restoreResult.success === true, "RS1 restore success")
  if (restoreResult.success) {
    assert(restoreResult.data.status === "VALID", "RS1 status VALID")
    assert(restoreResult.data.lessonBalance === 7, "RS1 balance 7")
    assert(typeof restoreResult.data.checkedInAt === "string", "RS1 checkedInAt")
  }
  console.log("✓ RS1 restore success (balance 8→7)")

  // RS2 — ALREADY_VALID
  const dupRestore = await attendanceService.restoreAttendance({
    attendanceId: record3.id,
  })
  assert(
    dupRestore.success === false && dupRestore.errorType === "ALREADY_VALID",
    "RS2 already valid"
  )
  console.log("✓ RS2 ALREADY_VALID")

  // RS3 — ATTENDANCE_NOT_FOUND
  const missing = await attendanceService.restoreAttendance({
    attendanceId: "nonexistent-cuid-id",
  })
  assert(
    missing.success === false && missing.errorType === "ATTENDANCE_NOT_FOUND",
    "RS3 not found"
  )
  console.log("✓ RS3 ATTENDANCE_NOT_FOUND")

  // HF1 — date range filter (before RS4 adds extra DAY_3 record)
  const hf1 = await attendanceService.listAttendanceHistory({
    dateFrom: DAY_3,
    dateTo: DAY_5,
  })
  assert(hf1.success === true && hf1.data.length === 2, "HF1 two records")
  console.log("✓ HF1 dateFrom/dateTo filter")

  // HF2 — studentId + date
  const hf2 = await attendanceService.listAttendanceHistory({
    studentId: xiaomingId,
    dateFrom: DAY_3,
    dateTo: DAY_5,
  })
  assert(hf2.success === true && hf2.data.length === 2, "HF2 combined filter")
  console.log("✓ HF2 studentId + date filter")

  // HF4 — dateFrom > dateTo
  const hf4 = await attendanceService.listAttendanceHistory({
    dateFrom: DAY_5,
    dateTo: DAY_3,
  })
  assert(
    hf4.success === false && hf4.errorType === "VALIDATION_ERROR",
    "HF4 range invalid"
  )
  console.log("✓ HF4 VALIDATION_ERROR (date range)")

  // RS4 — INSUFFICIENT_BALANCE
  const zeroRecord = await attendanceRepository.create({
    studentId: zeroBalanceId,
    attendanceDate: DAY_1,
  })
  await attendanceService.voidAttendance({ attendanceId: zeroRecord.id })
  const zeroBalance = await lessonBalanceRepository.getBalance(zeroBalanceId)
  assert(zeroBalance === 1, "zero student balance 1 after void")

  // consume balance via another check-in path: create valid uses balance
  const consume = await attendanceRepository.create({
    studentId: zeroBalanceId,
    attendanceDate: DAY_3,
  })
  assert(consume.id, "consume balance")
  const noBalance = await lessonBalanceRepository.getBalance(zeroBalanceId)
  assert(noBalance === 0, "balance 0")

  const insufficient = await attendanceService.restoreAttendance({
    attendanceId: zeroRecord.id,
  })
  assert(
    insufficient.success === false &&
      insufficient.errorType === "INSUFFICIENT_BALANCE",
    "RS4 insufficient balance"
  )
  console.log("✓ RS4 INSUFFICIENT_BALANCE")

  // RS5 — restore today → listToday CHECKED_IN
  const today = toAttendanceDate()
  const todayStudentId = await setupStudent("今日", 5)
  const todayRecord = await attendanceRepository.create({
    studentId: todayStudentId,
    attendanceDate: today,
  })
  const voidToday = await attendanceService.voidAttendance({
    attendanceId: todayRecord.id,
  })
  assert(voidToday.success === true, "RS5 setup void today")
  const todayBefore = await attendanceService.listTodayAttendance({
    attendanceDate: today,
  })
  assert(todayBefore.success === true, "RS5 list today before")
  if (todayBefore.success) {
    const row = todayBefore.data.find((r) => r.id === todayStudentId)
    assert(row !== undefined, "RS5 today student in list")
    assert(row.todayStatus === "VOIDED", `RS5 before restore: ${row.todayStatus}`)
    assert(row.canRestore === true, "RS5 can restore before restore")
  }

  const restoreToday = await attendanceService.restoreAttendance({
    attendanceId: todayRecord.id,
  })
  assert(restoreToday.success === true, "restore today")
  const todayAfter = await attendanceService.listTodayAttendance({
    attendanceDate: today,
  })
  if (todayAfter.success) {
    const row = todayAfter.data.find((r) => r.id === todayStudentId)
    assert(row?.todayStatus === "CHECKED_IN", "RS5 today CHECKED_IN")
  }
  console.log("✓ RS5 listToday CHECKED_IN after restore")

  // RS6 — history canVoid=true, canRestore=false
  const history = await attendanceService.listAttendanceHistory({
    studentId: xiaomingId,
  })
  if (history.success) {
    const restoredRow = history.data.find((r) => r.id === record3.id)
    assert(restoredRow?.canVoid === true, "RS6 canVoid true")
    assert(restoredRow?.canRestore === false, "RS6 canRestore false")
    const voidable = history.data.find((r) => r.id === record1.id)
    assert(voidable?.canRestore === false, "VALID canRestore false")
  }
  console.log("✓ RS6 history canVoid / canRestore")

  // HF3 — no params same as Sprint 5
  const hf3 = await listAttendanceHistoryAction()
  assert(hf3.success === true, "HF3 success")
  const testRows = hf3.data.filter((r) => r.studentName.startsWith(TEST_PREFIX))
  assert(testRows.length >= 5, "HF3 default list (backward compatible)")
  console.log("✓ HF3 default history (backward compatible)")

  // Validation — empty attendanceId
  const invalidRestore = await attendanceService.restoreAttendance({
    attendanceId: "",
  })
  assert(
    invalidRestore.success === false &&
      invalidRestore.errorType === "VALIDATION_ERROR",
    "restore validation"
  )
  console.log("✓ restore validator (id only)")

  // Action
  await attendanceService.voidAttendance({ attendanceId: record1.id })
  const actionRestore = await restoreAttendanceAction({
    attendanceId: record1.id,
  })
  assert(actionRestore.success === true, "restoreAttendanceAction")
  console.log("✓ restoreAttendanceAction")

  // Audits
  auditSource("src/features/attendance/validators/restore-attendance.validator.ts", [
    /attendanceRepository/,
    /findById/,
    /ALREADY_VALID/,
    /ATTENDANCE_NOT_FOUND/,
    /INSUFFICIENT_BALANCE/,
    /getBalance/,
    /status === "VALID"/,
  ])
  console.log("✓ restore-attendance.validator contract")

  auditSource("src/features/attendance/mappers/attendance-history.mapper.ts", [
    /attendanceRepository/,
    /studentRepository/,
    /attendanceService/,
    /lessonBalanceRepository/,
    /getBalance/,
  ])
  console.log("✓ attendance-history.mapper purity")

  auditSource("src/features/attendance/actions/restore-attendance.action.ts", [
    /attendanceRepository/,
    /studentRepository/,
    /lessonBalanceRepository/,
  ])
  console.log("✓ restore-attendance.action import audit")

  const serviceSource = readFileSync(
    join(process.cwd(), "src/features/attendance/services/attendance.service.ts"),
    "utf8"
  )
  const restoreFn = serviceSource.slice(
    serviceSource.indexOf("export async function restoreAttendance"),
    serviceSource.indexOf("export const attendanceService")
  )
  assert(restoreFn.includes("validateRestoreAttendanceInput"), "chain: validator")
  assert(restoreFn.indexOf("findById") < restoreFn.indexOf("ALREADY_VALID"), "chain: findById before ALREADY_VALID")
  assert(restoreFn.indexOf("ALREADY_VALID") < restoreFn.indexOf("getBalance"), "chain: ALREADY_VALID before getBalance")
  assert(restoreFn.indexOf("getBalance") < restoreFn.indexOf("restore("), "chain: getBalance before restore")
  assert(restoreFn.indexOf("restore(") < restoreFn.lastIndexOf("getBalance"), "chain: restore before final getBalance")
  assert(restoreFn.includes("toRestoreAttendanceResult"), "chain: mapper")
  console.log("✓ restoreAttendance frozen call chain")

  await cleanup()
  console.log("\nAll M2 attendance restore service tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM2 attendance restore test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
