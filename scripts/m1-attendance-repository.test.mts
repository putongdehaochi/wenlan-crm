/**
 * @file m1-attendance-repository.test.mts
 * @feature attendance
 * @purpose M1 数据层自测：Attendance Repository + lesson-balance 公式扩展
 *
 * 运行：npm run test:m1-attendance
 */

import "dotenv/config"

import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { lessonBalanceRepository } from "../src/features/lessons/repositories/lesson-balance.repository"
import { lessonPackageRepository } from "../src/features/lessons/repositories/lesson-package.repository"
import { studentRepository } from "../src/features/students/repositories/student.repository"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m1_attendance__"
const TODAY = toAttendanceDate()

async function getDefaultTeacherId(): Promise<string> {
  const teacher = await prisma.teacher.findFirst({
    where: { isDefault: true },
    orderBy: { createdAt: "asc" },
  })

  if (teacher) {
    return teacher.id
  }

  const created = await prisma.teacher.create({
    data: {
      id: "default-teacher",
      name: "默认老师",
      isDefault: true,
    },
  })

  return created.id
}

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

async function runTests(): Promise<void> {
  console.log("M1 Attendance Repository — self test\n")
  await cleanup()
  const defaultTeacherId = await getDefaultTeacherId()

  const student = await studentRepository.create({
    name: `${TEST_PREFIX}小明`,
    contactName: "明妈",
    phone: null,
    note: null,
  })

  await lessonPackageRepository.create({
    studentId: student.id,
    quantity: 10,
    note: null,
  })

  const balanceBefore = await lessonBalanceRepository.getBalance(student.id)
  assert(balanceBefore === 10, "balance before check-in is 10")
  console.log("✓ lessonBalanceRepository purchased only (10)")

  assert(
    (await attendanceRepository.existsToday(student.id, TODAY)) === false,
    "existsToday false before"
  )
  console.log("✓ attendanceRepository.existsToday (false)")

  const statusesEmpty = await attendanceRepository.getTodayStatuses(
    [student.id],
    TODAY
  )
  assert(statusesEmpty.size === 0, "getTodayStatuses empty")
  console.log("✓ attendanceRepository.getTodayStatuses (empty)")

  const created = await attendanceRepository.create({
    studentId: student.id,
    attendanceDate: TODAY,
    teacherId: defaultTeacherId,
  })
  assertAttendanceEntityShape(created)
  assert(created.status === "VALID", "create defaults VALID")
  console.log("✓ attendanceRepository.create")

  assert(
    (await attendanceRepository.existsToday(student.id, TODAY)) === true,
    "existsToday true after"
  )
  console.log("✓ attendanceRepository.existsToday (true)")

  const statuses = await attendanceRepository.getTodayStatuses(
    [student.id],
    TODAY
  )
  assert(statuses.has(student.id), "getTodayStatuses contains student")
  console.log("✓ attendanceRepository.getTodayStatuses (checked in)")

  const balanceAfter = await lessonBalanceRepository.getBalance(student.id)
  assert(balanceAfter === 9, "balance after check-in is 9")
  console.log("✓ lessonBalanceRepository formula: purchased − attendance")

  const studentB = await studentRepository.create({
    name: `${TEST_PREFIX}小红`,
    contactName: "红爸",
    phone: null,
    note: null,
  })
  await lessonPackageRepository.create({
    studentId: studentB.id,
    quantity: 5,
    note: null,
  })
  await attendanceRepository.create({
    studentId: studentB.id,
    attendanceDate: TODAY,
    teacherId: defaultTeacherId,
  })

  const batch = await lessonBalanceRepository.getBalances([
    student.id,
    studentB.id,
  ])
  assert(batch.get(student.id) === 9, "batch balance A")
  assert(batch.get(studentB.id) === 4, "batch balance B")
  console.log("✓ lessonBalanceRepository.getBalances (batch with attendance)")

  assert(
    !("getBalance" in attendanceRepository),
    "attendance repo must not expose getBalance"
  )
  assert(
    !("getBalances" in attendanceRepository),
    "attendance repo must not expose getBalances"
  )
  console.log("✓ attendanceRepository has no balance methods")

  const batchStatuses = await attendanceRepository.getTodayStatuses(
    [student.id, studentB.id, "nonexistent-id"],
    TODAY
  )
  assert(batchStatuses.size === 2, "batch statuses count")
  console.log("✓ getTodayStatuses batch (no N+1 per student)")

  let duplicateBlocked = false
  try {
    await prisma.attendance.create({
      data: {
        studentId: student.id,
        attendanceDate: TODAY,
        status: "VALID",
        teacherId: defaultTeacherId,
      },
    })
  } catch {
    duplicateBlocked = true
  }
  assert(duplicateBlocked, "unique studentId+attendanceDate")
  console.log("✓ unique constraint (studentId + attendanceDate)")

  await cleanup()
  console.log("\nAll M1 attendance repository tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM1 attendance test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
