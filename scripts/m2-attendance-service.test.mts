/**
 * @file m2-attendance-service.test.mts
 * @feature attendance
 * @purpose M2 业务层自测：Attendance Service + Actions
 *
 * 运行：npm run test:m2-attendance
 */

import "dotenv/config"

import { checkInStudentAction } from "../src/features/attendance/actions/check-in-student.action"
import { listTodayAttendanceAction } from "../src/features/attendance/actions/list-today-attendance.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { attendanceService } from "../src/features/attendance/services/attendance.service"
import { lessonPackageRepository } from "../src/features/lessons/repositories/lesson-package.repository"
import { getStudentAction } from "../src/features/students/actions/get-student.action"
import { listStudentsAction } from "../src/features/students/actions/list-students.action"
import { studentService } from "../src/features/students/services/student.service"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m2_attendance__"
const TODAY = toAttendanceDate()

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
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
  console.log("M2 Attendance Service — self test\n")
  await cleanup()

  const xiaomingId = await setupStudent("小明", 8)

  const listBefore = await attendanceService.listTodayAttendance({
    attendanceDate: TODAY,
  })
  assert(listBefore.success === true, "list today")
  if (listBefore.success) {
    const row = listBefore.data.find((r) => r.id === xiaomingId)
    assert(row != null, "row exists")
    assert(row!.lessonBalance === 8, "list balance 8")
    assert(row!.todayStatus === "NOT_CHECKED_IN", "not checked in")
    assert(row!.canCheckIn === true, "can check in")
  }
  console.log("✓ listTodayAttendance")

  const checkIn = await attendanceService.checkInStudent({
    studentId: xiaomingId,
    attendanceDate: TODAY,
  })
  assert(checkIn.success === true, "check in success")
  if (checkIn.success) {
    assert(checkIn.data.lessonBalance === 7, "balance after 7")
    assert(checkIn.data.todayStatus === "CHECKED_IN", "checked in status")
  }
  console.log("✓ checkInStudent success 8→7")

  const dup = await attendanceService.checkInStudent({
    studentId: xiaomingId,
    attendanceDate: TODAY,
  })
  assert(
    dup.success === false && dup.errorType === "ALREADY_CHECKED_IN",
    "duplicate check in"
  )
  console.log("✓ ALREADY_CHECKED_IN")

  const noBalanceCreated = await studentService.createStudent({
    name: `${TEST_PREFIX}零余额`,
    contactName: "家长",
  })
  assert(noBalanceCreated.success === true, "create zero balance student")
  if (!noBalanceCreated.success) throw new Error("setup failed")
  const noBalanceId = noBalanceCreated.data.id
  const noBalance = await attendanceService.checkInStudent({
    studentId: noBalanceId,
    attendanceDate: TODAY,
  })
  assert(
    noBalance.success === false &&
      noBalance.errorType === "INSUFFICIENT_BALANCE",
    "insufficient balance"
  )
  console.log("✓ INSUFFICIENT_BALANCE")

  const notFound = await attendanceService.checkInStudent({
    studentId: "nonexistent-cuid-id",
    attendanceDate: TODAY,
  })
  assert(
    notFound.success === false && notFound.errorType === "STUDENT_NOT_FOUND",
    "not found"
  )
  console.log("✓ STUDENT_NOT_FOUND")

  await prisma.student.create({
    data: {
      name: `${TEST_PREFIX}归档`,
      contactName: "家长",
      status: "ARCHIVED",
    },
  })
  const archived = await prisma.student.findFirst({
    where: { name: `${TEST_PREFIX}归档` },
  })
  const archivedCheckIn = await attendanceService.checkInStudent({
    studentId: archived!.id,
    attendanceDate: TODAY,
  })
  assert(
    archivedCheckIn.success === false &&
      archivedCheckIn.errorType === "STUDENT_ARCHIVED",
    "archived"
  )
  console.log("✓ STUDENT_ARCHIVED")

  const studentA = await setupStudent("学员A", 5)
  const studentB = await setupStudent("学员B", 3)
  const multiList = await attendanceService.listTodayAttendance({
    attendanceDate: TODAY,
  })
  if (multiList.success) {
    const rowA = multiList.data.find((r) => r.id === studentA)
    const rowB = multiList.data.find((r) => r.id === studentB)
    assert(rowA?.lessonBalance === 5 && rowB?.lessonBalance === 3, "multi balance")
  }
  console.log("✓ listTodayAttendance multi-student")

  const actionCheckIn = await checkInStudentAction({
    studentId: studentA,
    attendanceDate: TODAY,
  })
  assert(actionCheckIn.success === true, "action check in")
  console.log("✓ checkInStudentAction")

  const actionList = await listTodayAttendanceAction({ attendanceDate: TODAY })
  assert(actionList.success === true, "action list")
  console.log("✓ listTodayAttendanceAction")

  const studentList = await listStudentsAction()
  if (studentList.success) {
    const row = studentList.data.find((s) => s.id === xiaomingId)
    assert(row?.lessonBalance === 7, "student list reflects check-in")
  }
  console.log("✓ student list balance after check-in (student.service unchanged)")

  const studentDetail = await getStudentAction(xiaomingId)
  if (studentDetail.success) {
    assert(studentDetail.data.lessonBalance === 7, "student detail balance 7")
  }
  console.log("✓ getStudentAction balance after check-in")

  const lastSign = await setupStudent("最后一节", 1)
  const last = await attendanceService.checkInStudent({
    studentId: lastSign,
    attendanceDate: TODAY,
  })
  assert(last.success === true, "last lesson check in")
  if (last.success) {
    assert(last.data.lessonBalance === 0, "balance 0")
  }
  const afterLast = await attendanceService.checkInStudent({
    studentId: lastSign,
    attendanceDate: TODAY,
  })
  assert(
    afterLast.success === false &&
      (afterLast.errorType === "ALREADY_CHECKED_IN" ||
        afterLast.errorType === "INSUFFICIENT_BALANCE"),
    "cannot check in at 0"
  )
  console.log("✓ balance 1→0 last check-in")

  await cleanup()
  console.log("\nAll M2 attendance service tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM2 attendance test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
