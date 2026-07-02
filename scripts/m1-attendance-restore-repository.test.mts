/**
 * @file m1-attendance-restore-repository.test.mts
 * @feature attendance
 * @purpose Sprint 6 M1：restore() + findHistory dateFrom/dateTo + Repository 边界审计
 *
 * 运行：npm run test:m1-attendance-restore
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { studentRepository } from "../src/features/students/repositories/student.repository"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m1_att_restore__"
const DAY_1 = toAttendanceDate(new Date("2026-06-01"))
const DAY_3 = toAttendanceDate(new Date("2026-06-03"))
const DAY_5 = toAttendanceDate(new Date("2026-06-05"))

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

function assertAttendanceEntityShape(entity: unknown): void {
  assert(typeof entity === "object" && entity !== null, "entity is object")
  const e = entity as Record<string, unknown>
  assert(typeof e.id === "string", "id is string")
  assert(typeof e.studentId === "string", "studentId is string")
  assert(e.attendanceDate instanceof Date, "attendanceDate is Date")
  assert(e.status === "VALID" || e.status === "VOIDED", "status enum")
  assert(e.createdAt instanceof Date, "createdAt is Date")
  assert(!("lessonBalance" in e), "entity must not contain lessonBalance")
  assert(!("canRestore" in e), "entity must not contain canRestore")
}

function auditRepositorySource(forbiddenPatterns: RegExp[]): void {
  const source = readFileSync(
    join(process.cwd(), "src/features/attendance/repositories/attendance.repository.ts"),
    "utf8"
  )
  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(source), `attendance.repository must not match ${pattern}`)
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
  console.log("M1 Attendance Restore Repository — self test\n")
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

  // findHistory — dateFrom/dateTo closed interval
  const range = await attendanceRepository.findHistory({
    studentId: student.id,
    dateFrom: DAY_3,
    dateTo: DAY_5,
  })
  assert(range.length === 2, "date range returns 2")
  assert(
    range.every(
      (r) => r.attendanceDate >= DAY_3 && r.attendanceDate <= DAY_5
    ),
    "date range bounds"
  )
  console.log("✓ findHistory (dateFrom/dateTo)")

  // findHistory — dateFrom only
  const fromOnly = await attendanceRepository.findHistory({
    studentId: student.id,
    dateFrom: DAY_3,
  })
  assert(fromOnly.length === 2, "dateFrom only")
  console.log("✓ findHistory (dateFrom only)")

  // findHistory — no dates (Sprint 5 compatible)
  const all = await attendanceRepository.findHistory({ studentId: student.id })
  assert(all.length === 3, "no dates returns all 3")
  console.log("✓ findHistory (Sprint 5 compatible, no dates)")

  // findHistory — reserved fields ignored at repository layer
  const withReserved = await attendanceRepository.findHistory({
    studentId: student.id,
    dateTo: DAY_1,
    status: "VOIDED",
    teacherId: "reserved",
    classId: "reserved",
    cursor: "reserved",
  })
  assert(withReserved.length === 1, "reserved fields do not filter")
  assert(withReserved[0]!.id === record1.id, "dateTo still applies")
  console.log("✓ findHistory (reserved fields ignored)")

  // void then restore
  await attendanceRepository.void(record3.id)
  const beforeRestore = await attendanceRepository.findById(record3.id)
  assert(beforeRestore?.status === "VOIDED", "voided before restore")
  const originalCreatedAt = beforeRestore!.createdAt.getTime()

  const restored = await attendanceRepository.restore(record3.id)
  assertAttendanceEntityShape(restored)
  assert(restored.status === "VALID", "restore sets VALID")
  assert(
    restored.createdAt.getTime() === originalCreatedAt,
    "restore preserves createdAt"
  )
  assert(
    restored.attendanceDate.getTime() === DAY_5.getTime(),
    "restore preserves attendanceDate"
  )
  console.log("✓ attendanceRepository.restore (VOIDED → VALID)")

  // restore idempotent at DB layer (Service owns ALREADY_VALID)
  const restoredAgain = await attendanceRepository.restore(record3.id)
  assert(restoredAgain.status === "VALID", "restore idempotent at repo")
  console.log("✓ restore (no ALREADY_VALID check in repo)")

  // contract surface
  assert(typeof attendanceRepository.restore === "function", "restore exported")
  assert(
    !("getBalance" in attendanceRepository),
    "no getBalance on repo"
  )
  console.log("✓ attendanceRepository contract surface")

  auditRepositorySource([
    /lessonBalanceRepository/,
    /attendanceService/,
    /ALREADY_VALID/,
    /INSUFFICIENT_BALANCE/,
    /getBalance/,
    /canRestore/,
  ])
  console.log("✓ attendance.repository responsibility audit")

  await cleanup()
  console.log("\nAll M1 attendance restore repository tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM1 attendance restore test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
