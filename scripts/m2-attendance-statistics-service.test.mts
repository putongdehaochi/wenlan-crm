/**
 * @file m2-attendance-statistics-service.test.mts
 * @feature attendance
 * @purpose Sprint 7 M2：getAttendanceStatistics + 架构审计
 *
 * 运行：npm run test:m2-attendance-statistics
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { getAttendanceStatisticsAction } from "../src/features/attendance/actions/get-attendance-statistics.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { attendanceStatisticsService } from "../src/features/attendance/services/attendance-statistics.service"
import { lessonPackageRepository } from "../src/features/lessons/repositories/lesson-package.repository"
import { studentService } from "../src/features/students/services/student.service"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m2_att_stats__"
const DAY_1 = toAttendanceDate(new Date("2026-06-01"))
const DAY_10 = toAttendanceDate(new Date("2026-06-10"))
const DAY_20 = toAttendanceDate(new Date("2026-06-20"))
const RANGE_END = toAttendanceDate()

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

function auditSource(filePath: string, forbiddenPatterns: RegExp[]): void {
  const source = readFileSync(join(process.cwd(), filePath), "utf8")
  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(source), `${filePath} must not match ${pattern}`)
  }
}

function assertSummaryShape(summary: unknown): void {
  assert(typeof summary === "object" && summary !== null, "summary object")
  const s = summary as Record<string, unknown>
  assert(typeof s.totalAttendance === "number", "totalAttendance")
  assert(typeof s.validAttendance === "number", "validAttendance")
  assert(typeof s.voidedAttendance === "number", "voidedAttendance")
  assert(typeof s.restoreCount === "number", "restoreCount")
  assert(typeof s.consumedLessons === "number", "consumedLessons")
  assert(typeof s.checkInCount === "number", "checkInCount")
  assert(typeof s.voidEventCount === "number", "voidEventCount")
  assert(Array.isArray(s.studentRank), "studentRank")
  assert(Array.isArray(s.monthlyTrend), "monthlyTrend")
  assert(Array.isArray(s.remainingLessonRank), "remainingLessonRank")
  assert(s.teacherRank === undefined, "teacherRank reserved")
}

async function cleanup(): Promise<void> {
  await prisma.attendance.deleteMany({
    where: {
      student: {
        name: { startsWith: "__m2_att_" },
      },
    },
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
  console.log("M2 Attendance Statistics Service — self test\n")
  await cleanup()

  const xiaomingId = await setupStudent("小明", 20)
  const xiaohongId = await setupStudent("小红", 10)

  for (let i = 0; i < 7; i++) {
    await attendanceRepository.create({
      studentId: xiaomingId,
      attendanceDate: toAttendanceDate(new Date(`2026-06-${String(i + 1).padStart(2, "0")}`)),
    })
  }
  for (let i = 0; i < 3; i++) {
    await attendanceRepository.create({
      studentId: xiaohongId,
      attendanceDate: toAttendanceDate(new Date(`2026-06-${String(i + 11).padStart(2, "0")}`)),
    })
  }

  const voidTarget = await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_20,
  })
  await attendanceRepository.void(voidTarget.id)
  const restoreTarget = await attendanceRepository.create({
    studentId: xiaohongId,
    attendanceDate: DAY_20,
  })
  await attendanceRepository.void(restoreTarget.id)
  await attendanceRepository.restore(restoreTarget.id)

  // ST1 — per-student aggregate counts (isolated from DB pollution)
  const mingStats = await attendanceStatisticsService.getAttendanceStatistics({
    studentId: xiaomingId,
    dateFrom: DAY_1,
    dateTo: RANGE_END,
  })
  assert(mingStats.success === true, "ming stats success")
  if (mingStats.success) {
    assertSummaryShape(mingStats.data)
    assert(mingStats.data.totalAttendance === 8, "ming 8 total")
    assert(mingStats.data.validAttendance === 7, "ming 7 VALID")
    assert(mingStats.data.voidedAttendance === 1, "ming 1 VOIDED")
    assert(mingStats.data.checkInCount === 8, "ming 8 CHECK_IN")
    assert(mingStats.data.voidEventCount === 1, "ming 1 VOID event")
    assert(mingStats.data.consumedLessons === 7, "ming consumedLessons")
  }

  const hongStats = await attendanceStatisticsService.getAttendanceStatistics({
    studentId: xiaohongId,
    dateFrom: DAY_1,
    dateTo: RANGE_END,
  })
  assert(hongStats.success === true, "hong stats success")
  if (hongStats.success) {
    assert(hongStats.data.totalAttendance === 4, "hong 4 total")
    assert(hongStats.data.validAttendance === 4, "hong 4 VALID")
    assert(hongStats.data.restoreCount === 1, "hong 1 RESTORE")
    assert(hongStats.data.checkInCount === 4, "hong 4 CHECK_IN")
  }
  console.log("✓ getAttendanceStatistics (counts)")

  // ST2 — date range narrows (scoped to 小明)
  const juneEarly = await getAttendanceStatisticsAction({
    studentId: xiaomingId,
    dateFrom: DAY_1,
    dateTo: DAY_10,
  })
  assert(juneEarly.success === true, "range success")
  if (juneEarly.success) {
    assert(juneEarly.data.totalAttendance === 7, "early range total (ming only)")
  }
  console.log("✓ getAttendanceStatistics (date range)")

  // ST3 — student rank includes test students in correct order
  const all = await attendanceStatisticsService.getAttendanceStatistics({
    dateFrom: DAY_1,
    dateTo: RANGE_END,
  })
  assert(all.success === true, "rank stats success")
  if (all.success) {
    const mingRank = all.data.studentRank.find((r) => r.studentId === xiaomingId)
    const hongRank = all.data.studentRank.find((r) => r.studentId === xiaohongId)
    assert(mingRank !== undefined && hongRank !== undefined, "both in rank")
    assert(mingRank!.validAttendance === 7, "ming rank count")
    assert(hongRank!.validAttendance === 4, "hong rank count")
    assert(mingRank!.rank < hongRank!.rank, "ming ranked above hong")
    assert(mingRank!.studentName.includes("小明"), "rank name")
  }
  console.log("✓ getAttendanceStatistics (studentRank)")

  // ST4 — empty range
  const empty = await attendanceStatisticsService.getAttendanceStatistics({
    dateFrom: toAttendanceDate(new Date("2025-01-01")),
    dateTo: toAttendanceDate(new Date("2025-01-31")),
  })
  assert(empty.success === true, "empty success")
  if (empty.success) {
    assert(empty.data.totalAttendance === 0, "total 0")
    assert(empty.data.validAttendance === 0, "valid 0")
    assert(empty.data.studentRank.length === 0, "rank empty")
  }
  console.log("✓ getAttendanceStatistics (empty)")

  const invalidRange = await attendanceStatisticsService.getAttendanceStatistics({
    dateFrom: DAY_20,
    dateTo: DAY_1,
  })
  assert(
    invalidRange.success === false &&
      invalidRange.errorType === "VALIDATION_ERROR",
    "invalid date range"
  )
  console.log("✓ VALIDATION_ERROR (date range)")

  auditSource("src/features/attendance/services/attendance-statistics.service.ts", [
    /studentService\./,
    /from "@\/features\/students\/services/,
  ])
  console.log("✓ statistics service no studentService")

  auditSource("src/features/attendance/mappers/attendance-statistics.mapper.ts", [
    /attendanceStatisticsRepository/,
    /studentService\./,
    /prisma/,
  ])
  console.log("✓ statistics mapper purity")

  auditSource("src/features/attendance/actions/get-attendance-statistics.action.ts", [
    /Repository/,
    /studentService\./,
  ])
  console.log("✓ statistics action service-only")

  await cleanup()
  console.log("\nAll M2 attendance statistics service tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM2 attendance statistics test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
