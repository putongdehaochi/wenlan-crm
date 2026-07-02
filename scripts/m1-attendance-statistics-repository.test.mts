/**
 * @file m1-attendance-statistics-repository.test.mts
 * @feature attendance
 * @purpose Sprint 7/8 M1：Statistics Repository 聚合 · groupValidAttendanceByMonth · Aggregate-only 审计
 *
 * 运行：npm run test:m1-attendance-statistics
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { attendanceStatisticsRepository } from "../src/features/attendance/repositories/attendance-statistics.repository"
import { studentRepository } from "../src/features/students/repositories/student.repository"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m1_att_stats__"
const DAY_1 = toAttendanceDate(new Date("2026-06-01"))
const DAY_3 = toAttendanceDate(new Date("2026-06-03"))
const DAY_5 = toAttendanceDate(new Date("2026-06-05"))
const JULY_2 = toAttendanceDate(new Date("2026-07-02"))
const JULY_15 = toAttendanceDate(new Date("2026-07-15"))

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
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

async function runTests(): Promise<void> {
  console.log("M1 Attendance Statistics Repository — self test\n")
  await cleanup()

  const ming = await studentRepository.create({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
    phone: null,
    note: null,
  })
  const hong = await studentRepository.create({
    name: `${TEST_PREFIX}小红`,
    contactName: "红妈",
    phone: null,
    note: null,
  })

  await attendanceRepository.create({ studentId: ming.id, attendanceDate: DAY_1 })
  await attendanceRepository.create({ studentId: ming.id, attendanceDate: DAY_3 })
  const voidTarget = await attendanceRepository.create({
    studentId: ming.id,
    attendanceDate: DAY_5,
  })
  await attendanceRepository.create({ studentId: hong.id, attendanceDate: DAY_3 })
  await attendanceRepository.create({ studentId: ming.id, attendanceDate: JULY_2 })
  await attendanceRepository.create({ studentId: hong.id, attendanceDate: JULY_15 })

  await attendanceRepository.void(voidTarget.id)
  await attendanceRepository.restore(voidTarget.id)

  const filter = { studentId: ming.id }

  const total = await attendanceStatisticsRepository.countTotalAttendance(filter)
  assert(total === 4, "countTotalAttendance 4")
  console.log("✓ countTotalAttendance")

  const valid = await attendanceStatisticsRepository.countValidAttendance(filter)
  assert(valid === 4, "countValidAttendance 4")
  console.log("✓ countValidAttendance")

  const monthlyMing = await attendanceStatisticsRepository.groupValidAttendanceByMonth({
    studentId: ming.id,
  })
  const juneBeforeVoid = monthlyMing.find((row) => row.month === "2026-06")
  const julyBeforeVoid = monthlyMing.find((row) => row.month === "2026-07")
  assert(juneBeforeVoid?.validAttendanceCount === 3, "ming June valid 3")
  assert(julyBeforeVoid?.validAttendanceCount === 1, "ming July valid 1")
  assert(
    monthlyMing.every(
      (row) =>
        typeof row.month === "string" &&
        typeof row.validAttendanceCount === "number"
    ),
    "monthly row shape"
  )
  console.log("✓ groupValidAttendanceByMonth multi-month")

  await attendanceRepository.void(voidTarget.id)
  const validAfterVoid = await attendanceStatisticsRepository.countValidAttendance(filter)
  const voided = await attendanceStatisticsRepository.countVoidedAttendance(filter)
  assert(validAfterVoid === 3, "valid after void 3")
  assert(voided === 1, "voided 1")
  console.log("✓ countVoidedAttendance")

  const checkIns = await attendanceStatisticsRepository.countLifecycleEvents(
    filter,
    "CHECK_IN"
  )
  assert(checkIns === 4, "CHECK_IN events 4")
  console.log("✓ countLifecycleEvents CHECK_IN")

  const restores = await attendanceStatisticsRepository.countLifecycleEvents(
    filter,
    "RESTORE"
  )
  assert(restores === 1, "RESTORE events 1")
  console.log("✓ countLifecycleEvents RESTORE")

  const ranking = await attendanceStatisticsRepository.groupValidAttendanceByStudent(
    {},
    10
  )
  const mingRank = ranking.find((r) => r.studentId === ming.id)
  const hongRank = ranking.find((r) => r.studentId === hong.id)
  assert(mingRank?.validAttendance === 3, "ming ranking valid 3")
  assert(hongRank?.validAttendance === 2, "hong ranking valid 2")
  assert(!("studentName" in (ranking[0] ?? {})), "no studentName in aggregate")
  console.log("✓ groupValidAttendanceByStudent")

  // date filter
  const dateFilter = {
    dateFrom: DAY_3,
    dateTo: DAY_5,
    studentId: ming.id,
  }
  const ranged = await attendanceStatisticsRepository.countTotalAttendance(dateFilter)
  assert(ranged === 2, "date filter total 2")
  console.log("✓ statistics date filter")

  const monthlyAfterVoid =
    await attendanceStatisticsRepository.groupValidAttendanceByMonth({
      studentId: ming.id,
    })
  const juneAfterVoid = monthlyAfterVoid.find((row) => row.month === "2026-06")
  assert(
    juneAfterVoid?.validAttendanceCount === 2,
    "groupValidAttendanceByMonth VALID only after void"
  )
  console.log("✓ groupValidAttendanceByMonth VALID only")

  const monthlyRange =
    await attendanceStatisticsRepository.groupValidAttendanceByMonth({
      dateFrom: JULY_2,
      dateTo: JULY_15,
      studentId: hong.id,
    })
  assert(monthlyRange.length === 1, "date range one sparse month")
  assert(monthlyRange[0]?.month === "2026-07", "date range July")
  assert(monthlyRange[0]?.validAttendanceCount === 1, "date range hong July count 1")
  console.log("✓ groupValidAttendanceByMonth dateFrom/dateTo")

  const monthlyEmpty =
    await attendanceStatisticsRepository.groupValidAttendanceByMonth({
      studentId: "__nonexistent_student__",
    })
  assert(monthlyEmpty.length === 0, "no data returns empty array")
  console.log("✓ groupValidAttendanceByMonth empty")

  auditSource(
    "src/features/attendance/repositories/attendance-statistics.repository.ts",
    [
      /studentRepository/,
      /studentService/,
      /lessonBalanceRepository/,
      /getBalance/,
      /studentName/,
      /toStatisticsSummary/,
      /ViewModel/,
      /\.csv/,
      /BOM/,
      /zeroFill/,
      /remainingLesson/,
    ]
  )
  console.log("✓ statistics repository aggregate-only audit")

  assert(
    typeof attendanceStatisticsRepository.groupValidAttendanceByMonth === "function",
    "contract groupValidAttendanceByMonth"
  )
  assert(
    typeof attendanceStatisticsRepository.countTotalAttendance === "function",
    "contract countTotalAttendance"
  )
  assert(
    typeof attendanceStatisticsRepository.groupValidAttendanceByStudent === "function",
    "contract groupValidAttendanceByStudent"
  )
  console.log("✓ statistics repository contract surface")

  await cleanup()
  console.log("\nAll M1 attendance statistics repository tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM1 attendance statistics test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
