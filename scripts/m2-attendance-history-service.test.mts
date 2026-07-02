/**
 * @file m2-attendance-history-service.test.mts
 * @feature attendance
 * @purpose Sprint 5 M2：listAttendanceHistory / voidAttendance + 审计
 *
 * 运行：npm run test:m2-attendance-history
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { listAttendanceHistoryAction } from "../src/features/attendance/actions/list-attendance-history.action"
import { voidAttendanceAction } from "../src/features/attendance/actions/void-attendance.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { attendanceService } from "../src/features/attendance/services/attendance.service"
import { lessonBalanceRepository } from "../src/features/lessons/repositories/lesson-balance.repository"
import { lessonPackageRepository } from "../src/features/lessons/repositories/lesson-package.repository"
import { studentService } from "../src/features/students/services/student.service"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m2_att_history__"
const DAY_1 = toAttendanceDate(new Date("2026-06-01"))
const DAY_3 = toAttendanceDate(new Date("2026-06-03"))
const DAY_5 = toAttendanceDate(new Date("2026-06-05"))
const TODAY = toAttendanceDate()

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

function assertHistoryRowShape(row: unknown): void {
  assert(typeof row === "object" && row !== null, "row is object")
  const r = row as Record<string, unknown>
  assert(typeof r.id === "string", "id")
  assert(typeof r.studentId === "string", "studentId")
  assert(typeof r.studentName === "string", "studentName")
  assert(typeof r.attendanceDate === "string", "attendanceDate")
  assert(typeof r.quantityConsumed === "number", "quantityConsumed")
  assert(r.status === "VALID" || r.status === "VOIDED", "status")
  assert(typeof r.checkedInAt === "string", "checkedInAt")
  assert(r.voidedAt === null || typeof r.voidedAt === "string", "voidedAt")
  assert(typeof r.canVoid === "boolean", "canVoid")
  assert(typeof r.canRestore === "boolean", "canRestore")
  assert(!("lessonBalance" in r), "history row must not contain lessonBalance")
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
  console.log("M2 Attendance History Service — self test\n")
  await cleanup()

  const xiaomingId = await setupStudent("小明", 10)
  const xiaohongId = await setupStudent("小红", 5)

  const record1 = await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_1,
  })
  const record2 = await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_3,
  })
  const record3 = await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_5,
  })
  await attendanceRepository.create({
    studentId: xiaohongId,
    attendanceDate: DAY_3,
  })

  // H1 — all history desc
  const all = await attendanceService.listAttendanceHistory()
  assert(all.success === true, "list all success")
  if (all.success) {
    const xiaomingRows = all.data.filter((r) => r.studentId === xiaomingId)
    assert(xiaomingRows.length === 3, "xiaoming 3 records")
    xiaomingRows.forEach(assertHistoryRowShape)
    assert(xiaomingRows[0]!.attendanceDate === "2026-06-05", "newest first")
    assert(xiaomingRows[1]!.attendanceDate === "2026-06-03", "middle")
    assert(xiaomingRows[2]!.attendanceDate === "2026-06-01", "oldest")
    assert(xiaomingRows[0]!.studentName.includes("小明"), "studentName")
    assert(xiaomingRows[0]!.canVoid === true, "valid canVoid")
    assert(xiaomingRows[0]!.canRestore === false, "valid canRestore false")
    assert(xiaomingRows[0]!.quantityConsumed === 1, "quantityConsumed")
    assert(xiaomingRows[0]!.voidedAt === null, "voidedAt null")
  }
  console.log("✓ listAttendanceHistory (all, desc)")

  // H2 — filter by studentId
  const filtered = await attendanceService.listAttendanceHistory({
    studentId: xiaomingId,
  })
  assert(filtered.success === true && filtered.data.length === 3, "filter student")
  console.log("✓ listAttendanceHistory (studentId)")

  // H3 — multi student names
  if (all.success) {
    const hong = all.data.find((r) => r.studentId === xiaohongId)
    assert(hong?.studentName.includes("小红"), "hong name")
  }
  console.log("✓ listAttendanceHistory (multi student names)")

  // H5 — invalid studentId filter
  const notFound = await attendanceService.listAttendanceHistory({
    studentId: "nonexistent-cuid-id",
  })
  assert(
    notFound.success === false && notFound.errorType === "STUDENT_NOT_FOUND",
    "student not found filter"
  )
  console.log("✓ STUDENT_NOT_FOUND (history filter)")

  // H6 — archived student history
  await prisma.student.update({
    where: { id: xiaomingId },
    data: { status: "ARCHIVED" },
  })
  const archivedHistory = await attendanceService.listAttendanceHistory({
    studentId: xiaomingId,
  })
  assert(
    archivedHistory.success === true && archivedHistory.data.length === 3,
    "archived student history"
  )
  console.log("✓ archived student history still listed")

  // U1 — void success restores balance
  const balanceBeforeVoid = await lessonBalanceRepository.getBalance(xiaomingId)
  assert(balanceBeforeVoid === 7, "balance before void 7")

  const voidResult = await attendanceService.voidAttendance({
    attendanceId: record3.id,
  })
  assert(voidResult.success === true, "void success")
  if (voidResult.success) {
    assert(voidResult.data.status === "VOIDED", "void status")
    assert(voidResult.data.lessonBalance === 8, "balance after void 8")
  }
  console.log("✓ voidAttendance success (balance 7→8)")

  // U2 — ALREADY_VOIDED
  const dupVoid = await attendanceService.voidAttendance({
    attendanceId: record3.id,
  })
  assert(
    dupVoid.success === false && dupVoid.errorType === "ALREADY_VOIDED",
    "already voided"
  )
  console.log("✓ ALREADY_VOIDED")

  // U3 — ATTENDANCE_NOT_FOUND
  const missing = await attendanceService.voidAttendance({
    attendanceId: "nonexistent-cuid-id",
  })
  assert(
    missing.success === false && missing.errorType === "ATTENDANCE_NOT_FOUND",
    "attendance not found"
  )
  console.log("✓ ATTENDANCE_NOT_FOUND")

  // U4 — history reflects VOIDED
  const afterVoid = await attendanceService.listAttendanceHistory({
    studentId: xiaomingId,
  })
  if (afterVoid.success) {
    const voidedRow = afterVoid.data.find((r) => r.id === record3.id)
    assert(voidedRow?.status === "VOIDED", "voided status in history")
    assert(voidedRow?.canVoid === false, "canVoid false")
    assert(voidedRow?.canRestore === true, "canRestore true when voided")
    assert(voidedRow?.quantityConsumed === 0, "quantityConsumed 0 when voided")
  }
  console.log("✓ history after void (VOIDED, canVoid=false)")

  // Validation — empty attendanceId
  const invalidVoid = await attendanceService.voidAttendance({ attendanceId: "" })
  assert(
    invalidVoid.success === false && invalidVoid.errorType === "VALIDATION_ERROR",
    "void validation"
  )
  console.log("✓ void validator (id only)")

  // Actions
  const actionList = await listAttendanceHistoryAction({ limit: 2 })
  assert(actionList.success === true && actionList.data.length === 2, "action list")
  console.log("✓ listAttendanceHistoryAction")

  const todayRecord = await attendanceRepository.create({
    studentId: xiaohongId,
    attendanceDate: TODAY,
  })
  const actionVoid = await voidAttendanceAction({
    attendanceId: todayRecord.id,
  })
  assert(actionVoid.success === true, "action void")
  console.log("✓ voidAttendanceAction")

  // Audits
  auditSource("src/features/attendance/validators/void-attendance.validator.ts", [
    /attendanceRepository/,
    /findById/,
    /ALREADY_VOIDED/,
    /ATTENDANCE_NOT_FOUND/,
    /status === "VOIDED"/,
  ])
  console.log("✓ void-attendance.validator contract")

  auditSource("src/features/attendance/mappers/attendance-history.mapper.ts", [
    /attendanceRepository/,
    /studentRepository/,
    /attendanceService/,
    /lessonBalanceRepository/,
    /getBalance/,
  ])
  console.log("✓ attendance-history.mapper purity")

  auditSource("src/features/attendance/actions/list-attendance-history.action.ts", [
    /attendanceRepository/,
    /studentRepository/,
    /lessonBalanceRepository/,
  ])
  auditSource("src/features/attendance/actions/void-attendance.action.ts", [
    /attendanceRepository/,
    /studentRepository/,
    /lessonBalanceRepository/,
  ])
  console.log("✓ action import audit")

  await cleanup()
  console.log("\nAll M2 attendance history service tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM2 attendance history test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
