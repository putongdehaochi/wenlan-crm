/**
 * @file m4-attendance-export-trend-acceptance.test.mts
 * @feature attendance
 * @purpose Sprint 8 M4：Export / Trend / Rank Acceptance + UI 审计
 *
 * 运行：npm run test:m4-attendance-export-trend
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { exportAttendanceAuditAction } from "../src/features/attendance/actions/export-attendance-audit.action"
import { exportAttendanceStatisticsAction } from "../src/features/attendance/actions/export-attendance-statistics.action"
import { getAttendanceStatisticsAction } from "../src/features/attendance/actions/get-attendance-statistics.action"
import { listAttendanceAuditAction } from "../src/features/attendance/actions/list-attendance-audit.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { buildGetAttendanceStatisticsInput } from "../src/features/attendance/lib/attendance-statistics-query"
import { buildListAttendanceAuditInput } from "../src/features/attendance/lib/attendance-audit-query"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { attendanceStatisticsService } from "../src/features/attendance/services/attendance-statistics.service"
import { lessonPackageRepository } from "../src/features/lessons/repositories/lesson-package.repository"
import { studentService } from "../src/features/students/services/student.service"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m4_att_export__"
const JUNE_1 = toAttendanceDate(new Date("2099-06-01"))
const JUNE_5 = toAttendanceDate(new Date("2099-06-05"))
const JUNE_15 = toAttendanceDate(new Date("2099-06-15"))
const JULY_2 = toAttendanceDate(new Date("2099-07-02"))
const JULY_10 = toAttendanceDate(new Date("2099-07-10"))
const OUT_OF_RANGE = toAttendanceDate(new Date("2088-01-01"))
const EMPTY_RANGE_FROM = "2099-01-01"
const EMPTY_RANGE_TO = "2099-01-31"
const STATS_RANGE_FROM = "2099-06-01"
const STATS_RANGE_TO = "2099-08-31"
const AUDIT_RANGE_FROM = "2099-06-01"
const AUDIT_RANGE_TO = "2099-06-30"

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

function readSource(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8")
}

function auditSource(path: string, forbidden: RegExp[]): void {
  const source = readSource(path)
  for (const pattern of forbidden) {
    assert(!pattern.test(source), `${path} must not match ${pattern}`)
  }
}

function parseCsvLines(content: string): string[] {
  return content.replace(/^\uFEFF/, "").split("\n").filter(Boolean)
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

async function runAcceptance(): Promise<void> {
  console.log("M4 Attendance Export / Trend Acceptance — full chain test\n")
  await cleanup()

  const studentA = await setupStudent("甲", 30)
  const studentB = await setupStudent("乙", 20)
  const studentC = await setupStudent("丙", 25)
  const outsider = await setupStudent("外", 10)

  await attendanceRepository.create({ studentId: studentA, attendanceDate: JUNE_1 })
  await attendanceRepository.create({ studentId: studentA, attendanceDate: JUNE_5 })
  await attendanceRepository.create({ studentId: studentB, attendanceDate: JUNE_15 })
  await attendanceRepository.create({ studentId: studentC, attendanceDate: JULY_2 })
  await attendanceRepository.create({ studentId: studentA, attendanceDate: JULY_10 })
  await attendanceRepository.create({
    studentId: outsider,
    attendanceDate: OUT_OF_RANGE,
  })

  const auditInput = buildListAttendanceAuditInput({
    studentId: studentA,
    dateFrom: AUDIT_RANGE_FROM,
    dateTo: AUDIT_RANGE_TO,
  })

  // §9.1 EX1 — Audit export columns
  const list = await listAttendanceAuditAction(auditInput)
  assert(list.success === true && list.data.length === 2, "§9.1 EX1 audit rows")
  const auditExport = await exportAttendanceAuditAction(auditInput)
  assert(auditExport.success === true, "§9.1 EX1 export success")
  if (auditExport.success && list.success) {
    const lines = parseCsvLines(auditExport.data.content)
    assert(lines[0]?.includes("签到日期"), "§9.1 EX1 header")
    assert(lines.length === list.data.length + 1, "§9.1 EX1 row count")
    assert(auditExport.data.mimeType === "text/csv;charset=utf-8", "§9.1 EX5 mime")
    assert(auditExport.data.content.startsWith("\uFEFF"), "§9.1 EX6 BOM")
    assert(auditExport.data.fileName.startsWith("attendance-audit-"), "§9.1 EX2 fileName")
  }
  console.log("✓ §9.1 EX1/EX5/EX6 Audit export")

  // §9.1 EX2 — empty audit export
  const emptyExport = await exportAttendanceAuditAction({
    studentId: studentB,
    dateFrom: EMPTY_RANGE_FROM,
    dateTo: EMPTY_RANGE_TO,
  })
  assert(emptyExport.success === true, "§9.1 EX2 empty export success")
  if (emptyExport.success) {
    const lines = parseCsvLines(emptyExport.data.content)
    assert(lines.length === 1, "§9.1 EX2 header only")
  }
  console.log("✓ §9.1 EX2 empty Audit export")

  const statsInput = buildGetAttendanceStatisticsInput({
    dateFrom: STATS_RANGE_FROM,
    dateTo: STATS_RANGE_TO,
  })

  // §9.2 TR1/TR2 — monthly trend zero-fill
  const trendStats = await getAttendanceStatisticsAction(statsInput)
  assert(trendStats.success === true, "§9.2 TR trend stats")
  if (trendStats.success) {
    const trend = trendStats.data.monthlyTrend ?? []
    assert(trend.length === 3, "§9.2 TR2 three months")
    assert(trend[0]?.month === "2099-06", "§9.2 TR1 month order")
    assert(trend[0]?.validAttendanceCount === 3, "§9.2 TR1 June count")
    assert(trend[1]?.validAttendanceCount === 2, "§9.2 TR1 July count")
    assert(trend[2]?.validAttendanceCount === 0, "§9.2 TR2 August zero-fill")
  }
  console.log("✓ §9.2 TR1/TR2 monthlyTrend")

  // §9.2 TR3 — sparse without dates (scoped student)
  const sparse = await attendanceStatisticsService.getAttendanceStatistics({
    studentId: studentB,
  })
  assert(sparse.success === true, "§9.2 TR3 sparse")
  if (sparse.success) {
    assert(
      (sparse.data.monthlyTrend ?? []).every((point) => point.month.startsWith("2099-06")),
      "§9.2 TR3 sparse months only"
    )
  }
  console.log("✓ §9.2 TR3 sparse trend")

  // §9.2 TR4 — student filter
  const singleTrend = await getAttendanceStatisticsAction({
    studentId: studentB,
    dateFrom: STATS_RANGE_FROM,
    dateTo: STATS_RANGE_TO,
  })
  assert(singleTrend.success === true, "§9.2 TR4")
  if (singleTrend.success) {
    assert(
      singleTrend.data.monthlyTrend?.[0]?.validAttendanceCount === 1,
      "§9.2 TR4 single student"
    )
  }
  console.log("✓ §9.2 TR4 student trend filter")

  // §9.3 RR1/RR2 — remaining rank order + scope
  const rankStats = await getAttendanceStatisticsAction({
    dateFrom: STATS_RANGE_FROM,
    dateTo: STATS_RANGE_TO,
  })
  assert(rankStats.success === true, "§9.3 RR rank stats")
  if (rankStats.success) {
    const ranks = rankStats.data.remainingLessonRank ?? []
    assert(ranks.length === 3, "§9.3 RR2 in-scope only")
    assert(ranks[0]?.studentId === studentA, "§9.3 RR1 A first")
    assert(ranks[0]?.remainingLessons === 27, "§9.3 RR1 A balance")
    assert(ranks[1]?.studentId === studentC, "§9.3 RR1 C second")
    assert(ranks[1]?.remainingLessons === 24, "§9.3 RR1 C balance")
    assert(ranks[2]?.studentId === studentB, "§9.3 RR1 B third")
    assert(!ranks.some((row) => row.studentId === outsider), "§9.3 RR2 outsider excluded")
  }
  console.log("✓ §9.3 RR1/RR2 remainingLessonRank")

  // §9.3 RR3 — date filter does not change balance snapshot
  if (rankStats.success) {
    const narrowRank = await getAttendanceStatisticsAction({
      dateFrom: STATS_RANGE_FROM,
      dateTo: "2099-06-15",
    })
    assert(narrowRank.success === true, "§9.3 RR3 narrow")
    if (narrowRank.success) {
      const aRow = narrowRank.data.remainingLessonRank?.find(
        (row) => row.studentId === studentA
      )
      assert(aRow?.remainingLessons === 27, "§9.3 RR3 balance unchanged")
    }
  }
  console.log("✓ §9.3 RR3 balance snapshot")

  // §9.3 RR4 — no valid in range
  const emptyRank = await getAttendanceStatisticsAction({
    dateFrom: EMPTY_RANGE_FROM,
    dateTo: EMPTY_RANGE_TO,
  })
  assert(emptyRank.success === true, "§9.3 RR4")
  if (emptyRank.success) {
    assert(emptyRank.data.remainingLessonRank?.length === 0, "§9.3 RR4 empty rank")
  }
  console.log("✓ §9.3 RR4 empty rank")

  // §9.1 EX3/EX4 — Statistics export sections + consistency
  const summary = await getAttendanceStatisticsAction(statsInput)
  const statsExport = await exportAttendanceStatisticsAction(statsInput)
  assert(summary.success === true && statsExport.success === true, "§9.1 EX3")
  if (summary.success && statsExport.success) {
    const csv = statsExport.data.content.replace(/^\uFEFF/, "")
    assert(csv.includes("总签到次数"), "§9.1 EX3 summary section")
    assert(csv.includes(String(summary.data.validAttendance)), "§9.1 EX4 valid")
    assert(csv.includes(String(summary.data.voidEventCount)), "§9.1 EX4 voidEvent")
    assert(csv.includes("月份"), "§9.1 EX3 trend section")
    assert(csv.includes("剩余课时"), "§9.1 EX3 rank section")
    assert(
      statsExport.data.fileName.startsWith("attendance-statistics-"),
      "§9.1 EX3 fileName"
    )
  }
  console.log("✓ §9.1 EX3/EX4 Statistics export")

  // §9.4 R4/R5/R6 — architecture static audit
  auditSource("src/features/attendance/services/attendance-statistics.service.ts", [
    /studentService\./,
    /from "@\/features\/students\/services/,
  ])
  auditSource("src/features/attendance/services/attendance-export.service.ts", [
    /attendanceStatisticsRepository/,
    /toCsvLine/,
  ])
  assert(
    readSource("src/features/attendance/services/attendance-export.service.ts").includes(
      "getAttendanceStatistics"
    ),
    "§9.4 R6 export uses getAttendanceStatistics"
  )
  auditSource("src/features/attendance/components/attendance-statistics-summary.tsx", [
    /\.reduce\s*\(/,
    /studentRank\.sort/,
    /monthlyTrend\.sort/,
    /remainingLessonRank\.sort/,
  ])
  auditSource("src/features/attendance/components/attendance-monthly-trend.tsx", [
    /\.sort\s*\(/,
    /\.reduce\s*\(/,
  ])
  auditSource("src/features/attendance/components/attendance-remaining-rank.tsx", [
    /\.sort\s*\(/,
    /\.reduce\s*\(/,
  ])
  auditSource("src/features/attendance/components/attendance-export-download-button.tsx", [
    /toCsvLine/,
    /join\(\","\)/,
  ])
  console.log("✓ §9.4 R4/R5/R6 architecture audit")

  // NF-UI-1 — export query builders used on pages
  const auditPage = readSource(
    "src/features/attendance/components/attendance-audit-page.tsx"
  )
  assert(
    auditPage.includes("buildListAttendanceAuditInput"),
    "NF-UI-1 audit export query同源"
  )
  const statsPage = readSource(
    "src/features/attendance/components/attendance-statistics-page.tsx"
  )
  assert(
    statsPage.includes("buildGetAttendanceStatisticsInput"),
    "NF-UI-1 statistics export query同源"
  )
  console.log("✓ NF-UI-1 export query binding")

  await cleanup()
  console.log("\nAll M4 attendance export / trend acceptance tests passed.")
}

runAcceptance()
  .catch((error) => {
    console.error("\nM4 attendance export / trend acceptance failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
