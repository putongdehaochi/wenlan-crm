/**
 * @file m1-attendance-history-repository.test.mts
 * @feature attendance
 * @purpose Sprint 5 M1：findById / findHistory / void / findByIds + Repository 边界审计
 *
 * 运行：npm run test:m1-attendance-history
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { studentRepository } from "../src/features/students/repositories/student.repository"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m1_att_history__"
const TODAY = toAttendanceDate()
const YESTERDAY = toAttendanceDate(
  new Date(TODAY.getTime() - 24 * 60 * 60 * 1000)
)

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
  assert(!("studentName" in e), "entity must not contain studentName")
}

function assertStudentEntityShape(entity: unknown): void {
  assert(typeof entity === "object" && entity !== null, "entity is object")
  const e = entity as Record<string, unknown>
  assert(typeof e.id === "string", "id is string")
  assert(typeof e.name === "string", "name is string")
  assert(!("lessonBalance" in e), "student entity must not contain lessonBalance")
}

async function cleanup(): Promise<void> {
  await prisma.attendance.deleteMany({
    where: { student: { name: { startsWith: TEST_PREFIX } } },
  })
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

function auditRepositorySource(
  filePath: string,
  forbiddenPatterns: RegExp[]
): void {
  const source = readFileSync(join(process.cwd(), filePath), "utf8")
  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(source), `${filePath} must not match ${pattern}`)
  }
}

async function runTests(): Promise<void> {
  console.log("M1 Attendance History Repository — self test\n")
  await cleanup()

  const studentA = await studentRepository.create({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
    phone: null,
    note: null,
  })
  const studentB = await studentRepository.create({
    name: `${TEST_PREFIX}小红`,
    contactName: "红爸",
    phone: null,
    note: null,
  })

  const older = await attendanceRepository.create({
    studentId: studentA.id,
    attendanceDate: YESTERDAY,
  })
  const newer = await attendanceRepository.create({
    studentId: studentA.id,
    attendanceDate: TODAY,
  })
  const studentBRecord = await attendanceRepository.create({
    studentId: studentB.id,
    attendanceDate: TODAY,
  })

  // findById
  const found = await attendanceRepository.findById(newer.id)
  assert(found !== null, "findById returns entity")
  assertAttendanceEntityShape(found)
  assert(found!.id === newer.id, "findById id match")
  console.log("✓ attendanceRepository.findById (found)")

  const notFound = await attendanceRepository.findById("nonexistent-id")
  assert(notFound === null, "findById null when missing")
  console.log("✓ attendanceRepository.findById (null)")

  // findHistory — all, desc order
  const allHistory = await attendanceRepository.findHistory({})
  assert(allHistory.length >= 3, "findHistory all returns records")
  allHistory.forEach(assertAttendanceEntityShape)
  assert(
    allHistory[0]!.attendanceDate >= allHistory[1]!.attendanceDate,
    "findHistory orderBy attendanceDate desc"
  )
  console.log("✓ attendanceRepository.findHistory (all, desc)")

  // findHistory — studentId filter
  const studentAHistory = await attendanceRepository.findHistory({
    studentId: studentA.id,
  })
  assert(studentAHistory.length === 2, "findHistory studentId filter")
  assert(
    studentAHistory.every((row) => row.studentId === studentA.id),
    "findHistory studentId scope"
  )
  console.log("✓ attendanceRepository.findHistory (studentId)")

  // findHistory — limit
  const limited = await attendanceRepository.findHistory({
    studentId: studentA.id,
    limit: 1,
  })
  assert(limited.length === 1, "findHistory limit")
  assert(limited[0]!.id === newer.id, "findHistory limit returns newest")
  console.log("✓ attendanceRepository.findHistory (limit)")

  // void — repository only updates status, no business checks
  const voided = await attendanceRepository.void(studentBRecord.id)
  assertAttendanceEntityShape(voided)
  assert(voided.status === "VOIDED", "void sets VOIDED")
  const reloaded = await attendanceRepository.findById(studentBRecord.id)
  assert(reloaded?.status === "VOIDED", "void persisted")
  console.log("✓ attendanceRepository.void")

  // void does not block double-void at repository layer (Service owns ALREADY_VOIDED)
  const voidedAgain = await attendanceRepository.void(studentBRecord.id)
  assert(voidedAgain.status === "VOIDED", "void idempotent at DB layer")
  console.log("✓ attendanceRepository.void (no ALREADY_VOIDED check in repo)")

  // findByIds
  const students = await studentRepository.findByIds([studentA.id, studentB.id])
  assert(students.length === 2, "findByIds count")
  students.forEach(assertStudentEntityShape)
  const names = new Set(students.map((s) => s.name))
  assert(names.has(studentA.name), "findByIds contains A")
  assert(names.has(studentB.name), "findByIds contains B")
  console.log("✓ studentRepository.findByIds")

  const emptyIds = await studentRepository.findByIds([])
  assert(emptyIds.length === 0, "findByIds empty input")
  console.log("✓ studentRepository.findByIds (empty)")

  // Repository contract surface
  assert(typeof attendanceRepository.findById === "function", "findById exported")
  assert(typeof attendanceRepository.findHistory === "function", "findHistory exported")
  assert(typeof attendanceRepository.void === "function", "void exported")
  assert(
    !("getBalance" in attendanceRepository),
    "attendance repo must not expose getBalance"
  )
  assert(
    !("getBalances" in attendanceRepository),
    "attendance repo must not expose getBalances"
  )
  console.log("✓ attendanceRepository contract surface")

  // Source audits — no business logic in repository
  auditRepositorySource("src/features/attendance/repositories/attendance.repository.ts", [
    /lessonBalanceRepository/,
    /attendanceService/,
    /studentService/,
    /ALREADY_VOIDED/,
    /ATTENDANCE_NOT_FOUND/,
    /canVoid/,
    /getBalance/,
  ])
  console.log("✓ attendance.repository import / responsibility audit")

  auditRepositorySource("src/features/students/repositories/student.repository.ts", [
    /attendanceRepository/,
    /lessonPackageRepository/,
    /lessonBalanceRepository/,
    /prisma\.attendance/,
    /AttendanceHistoryRow/,
  ])
  console.log("✓ student.repository import / responsibility audit")

  await cleanup()
  console.log("\nAll M1 attendance history repository tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM1 attendance history test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
