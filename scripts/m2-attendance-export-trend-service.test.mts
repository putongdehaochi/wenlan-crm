/**
 * @file m2-attendance-export-trend-service.test.mts
 * @feature attendance
 * @purpose Sprint 8 M2：Export / Trend / Rank Service + Serializer
 *
 * 运行：npm run test:m2-attendance-export-trend
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { exportAttendanceAuditAction } from "../src/features/attendance/actions/export-attendance-audit.action"
import { exportAttendanceStatisticsAction } from "../src/features/attendance/actions/export-attendance-statistics.action"
import { listAttendanceAuditAction } from "../src/features/attendance/actions/list-attendance-audit.action"
import { getAttendanceStatisticsAction } from "../src/features/attendance/actions/get-attendance-statistics.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { attendanceStatisticsService } from "../src/features/attendance/services/attendance-statistics.service"
import { lessonPackageRepository } from "../src/features/lessons/repositories/lesson-package.repository"
import { studentService } from "../src/features/students/services/student.service"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m2_att_export__"
const JUNE_1 = toAttendanceDate(new Date("2026-06-01"))
const JUNE_15 = toAttendanceDate(new Date("2026-06-15"))
const JULY_1 = toAttendanceDate(new Date("2026-07-01"))
const AUG_1 = toAttendanceDate(new Date("2026-08-01"))

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
  console.log("M2 Attendance Export / Trend Service — self test\n")
  await cleanup()

  const mingId = await setupStudent("小明", 20)
  const hongId = await setupStudent("小红", 10)

  await attendanceRepository.create({ studentId: mingId, attendanceDate: JUNE_1 })
  await attendanceRepository.create({ studentId: mingId, attendanceDate: JUNE_15 })
  await attendanceRepository.create({ studentId: hongId, attendanceDate: JULY_1 })
  const voidTarget = await attendanceRepository.create({
    studentId: hongId,
    attendanceDate: AUG_1,
  })
  await attendanceRepository.void(voidTarget.id)

  const statsInput = {
    dateFrom: JUNE_1,
    dateTo: AUG_1,
    studentId: hongId,
  }

  const stats = await attendanceStatisticsService.getAttendanceStatistics(statsInput)
  assert(stats.success === true, "stats success")
  if (!stats.success) throw new Error("stats failed")

  assert(typeof stats.data.voidEventCount === "number", "voidEventCount")
  assert(stats.data.voidEventCount === 1, "hong voidEventCount 1")
  assert(Array.isArray(stats.data.monthlyTrend), "monthlyTrend array")
  assert(stats.data.monthlyTrend!.length === 3, "monthlyTrend zero-fill 3 months")
  assert(stats.data.monthlyTrend![0]?.validAttendanceCount === 0, "June zero for hong")
  assert(stats.data.monthlyTrend![1]?.validAttendanceCount === 1, "July valid 1")
  assert(stats.data.monthlyTrend![2]?.validAttendanceCount === 0, "August zero-fill")
  console.log("✓ monthlyTrend zero-fill")

  assert(Array.isArray(stats.data.remainingLessonRank), "remainingLessonRank array")
  assert(stats.data.remainingLessonRank!.length === 1, "hong only in scoped rank")
  const hongRank = stats.data.remainingLessonRank![0]
  assert(hongRank?.studentId === hongId, "hong in remaining rank")
  assert(hongRank!.remainingLessons === 9, "hong balance 10-1")
  assert(hongRank!.rank === 1, "hong rank 1")

  const mingStats = await attendanceStatisticsService.getAttendanceStatistics({
    studentId: mingId,
    dateFrom: JUNE_1,
    dateTo: AUG_1,
  })
  assert(mingStats.success === true, "ming stats success")
  if (mingStats.success) {
    const mingRank = mingStats.data.remainingLessonRank!.find((r) => r.studentId === mingId)
    assert(mingRank?.remainingLessons === 18, "ming balance 20-2")
    assert(mingRank?.rank === 1, "ming rank 1")
  }
  console.log("✓ remainingLessonRank order")

  const list = await listAttendanceAuditAction({ studentId: mingId })
  assert(list.success === true, "audit list success")
  const auditExport = await exportAttendanceAuditAction({ studentId: mingId })
  assert(auditExport.success === true, "audit export success")
  if (list.success && auditExport.success) {
    assert(
      auditExport.data.content.includes(list.data[0]?.studentName ?? ""),
      "audit export contains student"
    )
    assert(
      (auditExport.data.content.match(/\n/g) ?? []).length === list.data.length,
      "audit export row count matches list"
    )
    assert(auditExport.data.mimeType === "text/csv;charset=utf-8", "audit mime")
    assert(auditExport.data.fileName.startsWith("attendance-audit-"), "audit fileName")
    assert(auditExport.data.content.startsWith("\uFEFF"), "audit BOM")
  }
  console.log("✓ exportAttendanceAudit matches listAttendanceAudit")

  const summary = await getAttendanceStatisticsAction(statsInput)
  assert(summary.success === true, "summary action success")
  const statsExport = await exportAttendanceStatisticsAction(statsInput)
  assert(statsExport.success === true, "statistics export success")
  if (summary.success && statsExport.success) {
    assert(
      statsExport.data.content.includes(String(summary.data.validAttendance)),
      "export includes validAttendance"
    )
    assert(
      statsExport.data.content.includes(String(summary.data.voidEventCount)),
      "export includes voidEventCount"
    )
    assert(
      statsExport.data.content.includes("2026-07"),
      "export includes monthly trend"
    )
    assert(
      statsExport.data.content.includes(String(hongRank!.remainingLessons)),
      "export includes remaining lessons"
    )
  }
  console.log("✓ exportAttendanceStatistics matches getAttendanceStatistics")

  const reserved = await exportAttendanceAuditAction({
    teacherId: "t1",
  } as never)
  assert(
    reserved.success === false && reserved.errorType === "VALIDATION_ERROR",
    "reserved teacherId rejected"
  )
  console.log("✓ export reserved filter rejected")

  auditSource("src/features/attendance/services/attendance-export.service.ts", [
    /attendanceStatisticsRepository/,
    /countTotalAttendance/,
    /groupValidAttendanceByMonth/,
    /\.csv/,
    /toCsvLine/,
  ])
  console.log("✓ export service no duplicate statistics")

  auditSource("src/features/attendance/services/attendance-statistics.service.ts", [
    /studentService\./,
    /toStatisticsCsvPayload/,
    /toAuditCsvPayload/,
  ])
  console.log("✓ statistics service no export csv")

  auditSource("src/features/attendance/serializers/attendance-export.serializer.ts", [
    /Repository/,
    /prisma/,
    /getAttendanceStatistics/,
  ])
  console.log("✓ serializer csv-only boundary")

  await cleanup()
  console.log("\nAll M2 attendance export / trend service tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM2 attendance export / trend test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
