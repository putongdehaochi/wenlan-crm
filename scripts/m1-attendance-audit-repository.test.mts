/**
 * @file m1-attendance-audit-repository.test.mts
 * @feature attendance
 * @purpose Sprint 7 M1：findAuditList · Lifecycle · voidedAt · 事务序 · Repository 边界审计
 *
 * 运行：npm run test:m1-attendance-audit
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceLifecycleRepository } from "../src/features/attendance/repositories/attendance-lifecycle.repository"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { studentRepository } from "../src/features/students/repositories/student.repository"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m1_att_audit__"
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

function assertTransactionOrder(): void {
  const source = readFileSync(
    join(process.cwd(), "src/features/attendance/repositories/attendance.repository.ts"),
    "utf8"
  )
  const voidBlock = source.slice(
    source.indexOf("export async function voidRecord"),
    source.indexOf("export async function restoreRecord")
  )
  const restoreBlock = source.slice(
    source.indexOf("export async function restoreRecord"),
    source.indexOf("export const attendanceRepository")
  )
  const createBlock = source.slice(
    source.indexOf("export async function create("),
    source.indexOf("export async function existsToday")
  )

  for (const block of [createBlock, voidBlock, restoreBlock]) {
    assert(
      block.indexOf(".create(") < block.indexOf("appendLifecycleEvent") ||
        block.indexOf(".update(") < block.indexOf("appendLifecycleEvent"),
      "Attendance write before appendLifecycleEvent"
    )
  }
}

async function cleanup(): Promise<void> {
  await prisma.attendance.deleteMany({
    where: { student: { name: { startsWith: TEST_PREFIX } } },
  })
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

async function runTests(): Promise<void> {
  console.log("M1 Attendance Audit Repository — self test\n")
  await cleanup()

  const student = await studentRepository.create({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
    phone: null,
    note: null,
  })

  const record1 = await attendanceRepository.create({
    studentId: student.id,
    attendanceDate: DAY_1,
  })
  await attendanceRepository.create({
    studentId: student.id,
    attendanceDate: DAY_3,
  })
  const record3 = await attendanceRepository.create({
    studentId: student.id,
    attendanceDate: DAY_5,
  })

  // create → CHECK_IN event
  const checkInEvents = await attendanceLifecycleRepository.findByAttendanceId(
    record1.id
  )
  assert(checkInEvents.length === 1, "create writes CHECK_IN")
  assert(checkInEvents[0]!.eventType === "CHECK_IN", "CHECK_IN type")
  assert(record1.voidedAt === null, "create voidedAt null")

  // findAuditList — all
  const all = await attendanceRepository.findAuditList({ studentId: student.id })
  assert(all.length === 3, "findAuditList all")
  assert(all.every((r) => r.voidedAt === null || r.voidedAt instanceof Date), "voidedAt shape")
  console.log("✓ findAuditList (all)")

  // findAuditList — status VALID
  const validOnly = await attendanceRepository.findAuditList({
    studentId: student.id,
    status: "VALID",
  })
  assert(validOnly.length === 3 && validOnly.every((r) => r.status === "VALID"), "status VALID")
  console.log("✓ findAuditList (status=VALID)")

  // findAuditList — date range
  const range = await attendanceRepository.findAuditList({
    studentId: student.id,
    dateFrom: DAY_3,
    dateTo: DAY_5,
  })
  assert(range.length === 2, "date range 2")
  console.log("✓ findAuditList (dateFrom/dateTo)")

  // void → VOID event + voidedAt
  const voided = await attendanceRepository.void(record3.id)
  assert(voided.status === "VOIDED", "void status")
  assert(voided.voidedAt instanceof Date, "void sets voidedAt")
  const voidEvents = await attendanceLifecycleRepository.findByAttendanceId(record3.id)
  assert(voidEvents.length === 2, "CHECK_IN + VOID")
  assert(
    voidEvents.some((e) => e.eventType === "VOID"),
    "VOID event exists"
  )
  console.log("✓ void + VOID lifecycle event")

  // findAuditList — status VOIDED
  const voidedList = await attendanceRepository.findAuditList({
    studentId: student.id,
    status: "VOIDED",
  })
  assert(voidedList.length === 1 && voidedList[0]!.id === record3.id, "status VOIDED filter")
  console.log("✓ findAuditList (status=VOIDED)")

  // restore → RESTORE event + voidedAt null
  const restored = await attendanceRepository.restore(record3.id)
  assert(restored.status === "VALID", "restore VALID")
  assert(restored.voidedAt === null, "restore clears voidedAt")
  const restoreEvents = await attendanceLifecycleRepository.findByAttendanceId(record3.id)
  assert(restoreEvents.length === 3, "CHECK_IN + VOID + RESTORE")
  assert(
    restoreEvents.some((e) => e.eventType === "RESTORE"),
    "RESTORE event preserved after restore"
  )
  console.log("✓ restore + RESTORE lifecycle event")

  // findByAttendanceIds batch
  const batch = await attendanceLifecycleRepository.findByAttendanceIds([
    record1.id,
    record3.id,
  ])
  assert(batch.length >= 4, "batch events")
  console.log("✓ findByAttendanceIds (batch)")

  // contract surface
  assert(typeof attendanceRepository.findAuditList === "function", "findAuditList exported")
  assert(
    typeof attendanceLifecycleRepository.appendLifecycleEvent === "function",
    "appendLifecycleEvent exported"
  )
  console.log("✓ repository contract surface")

  auditSource("src/features/attendance/repositories/attendance-lifecycle.repository.ts", [
    /studentRepository/,
    /lessonBalanceRepository/,
    /toAuditTimeline/,
    /label/,
    /orderBy.*occurredAt/,
  ])
  console.log("✓ lifecycle repository no sort/label")

  auditSource("src/features/attendance/repositories/attendance.repository.ts", [
    /attendanceStatisticsRepository/,
    /studentService/,
    /getBalance/,
  ])
  console.log("✓ attendance.repository audit boundary")

  assertTransactionOrder()
  console.log("✓ transaction order (Attendance → Lifecycle)")

  await cleanup()
  console.log("\nAll M1 attendance audit repository tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM1 attendance audit test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
