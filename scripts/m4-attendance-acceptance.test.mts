/**
 * @file m4-attendance-acceptance.test.mts
 * @feature attendance
 * @purpose M4 验收：PostgreSQL → Repository → Service → Action 全链路
 *
 * 覆盖 specs/attendance.md §5.3 全部 8 条 + Attendance/Student/Lesson 回归
 *
 * 运行：npm run test:m4-attendance
 */

import "dotenv/config"

import { readFileSync } from "node:fs"
import { join } from "node:path"

import { checkInStudentAction } from "../src/features/attendance/actions/check-in-student.action"
import { listTodayAttendanceAction } from "../src/features/attendance/actions/list-today-attendance.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import { createLessonPurchaseAction } from "../src/features/lessons/actions/create-lesson-purchase.action"
import { createStudentAction } from "../src/features/students/actions/create-student.action"
import { getStudentAction } from "../src/features/students/actions/get-student.action"
import { listStudentsAction } from "../src/features/students/actions/list-students.action"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m4_attendance__"
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

async function createStudentWithBalance(name: string, quantity: number) {
  const created = await createStudentAction({
    name: `${TEST_PREFIX}${name}`,
    contactName: "家长",
  })
  assert(created.success === true, `create student ${name}`)
  if (!created.success) throw new Error("setup failed")

  if (quantity > 0) {
    const purchase = await createLessonPurchaseAction({
      studentId: created.data.id,
      quantity,
    })
    assert(purchase.success === true, `purchase ${quantity} for ${name}`)
  }

  return created.data.id
}

async function countValidAttendance(studentId: string): Promise<number> {
  return prisma.attendance.count({
    where: { studentId, status: "VALID" },
  })
}

function assertUiLayerCompliance(): void {
  const page = readFileSync(
    join(
      process.cwd(),
      "src/features/attendance/components/attendance-page.tsx"
    ),
    "utf8"
  )
  assert(page.includes("listTodayAttendanceAction"), "page uses list action")
  assert(page.includes("checkInStudentAction"), "page uses check-in action")
  assert(!/import.*attendanceService/.test(page), "page no Service")
  assert(!/import.*repository/i.test(page), "page no Repository")

  const row = readFileSync(
    join(
      process.cwd(),
      "src/features/attendance/components/attendance-today-row.tsx"
    ),
    "utf8"
  )
  assert(row.includes("canCheckIn"), "row uses canCheckIn from ViewModel")
  assert(!/import.*Action/.test(row), "row no Action import")
  assert(!/import.*Service/.test(row), "row no Service import")
  assert(!/import.*repository/i.test(row), "row no Repository")

  const list = readFileSync(
    join(
      process.cwd(),
      "src/features/attendance/components/attendance-today-list.tsx"
    ),
    "utf8"
  )
  assert(!/import.*Action/.test(list), "list no Action import")
  assert(!/lessonBalance\s*[<>=]/.test(list), "list no balance business logic")
}

async function runAcceptance(): Promise<void> {
  console.log("M4 Attendance Acceptance — full chain test\n")
  await cleanup()

  // §5.3 #1 — 小明在读、余额 8、今日未签 → 签到 → 已签到，余额 7
  const xiaomingId = await createStudentWithBalance("小明", 8)

  const listBefore = await listTodayAttendanceAction({ attendanceDate: TODAY })
  assert(listBefore.success === true, "list before check-in")
  if (listBefore.success) {
    const row = listBefore.data.find((r) => r.id === xiaomingId)
    assert(row?.lessonBalance === 8, "balance 8 before")
    assert(row?.todayStatus === "NOT_CHECKED_IN", "not checked in")
    assert(row?.canCheckIn === true, "can check in")
  }

  const firstCheckIn = await checkInStudentAction({
    studentId: xiaomingId,
    attendanceDate: TODAY,
  })
  assert(firstCheckIn.success === true, "first check-in success")
  if (firstCheckIn.success) {
    assert(firstCheckIn.data.lessonBalance === 7, "balance 7 after")
    assert(firstCheckIn.data.todayStatus === "CHECKED_IN", "checked in")
  }

  const attendanceCount1 = await countValidAttendance(xiaomingId)
  assert(attendanceCount1 === 1, "one VALID attendance record")
  console.log("✓ §5.3 #1 小明 8→7，首次签到成功")

  // §5.3 #2 — 小明今日已签 → 再签 → ALREADY_CHECKED_IN，余额不变
  const dup = await checkInStudentAction({
    studentId: xiaomingId,
    attendanceDate: TODAY,
  })
  assert(
    dup.success === false && dup.errorType === "ALREADY_CHECKED_IN",
    "ALREADY_CHECKED_IN"
  )
  const afterDup = await listTodayAttendanceAction({ attendanceDate: TODAY })
  if (afterDup.success) {
    const row = afterDup.data.find((r) => r.id === xiaomingId)
    assert(row?.lessonBalance === 7, "balance unchanged after dup")
    assert(row?.todayStatus === "CHECKED_IN", "still checked in")
  }
  assert((await countValidAttendance(xiaomingId)) === 1, "still one record")
  console.log("✓ §5.3 #2 重复签到 ALREADY_CHECKED_IN，余额不变")

  // §5.3 #3 — 小红余额 0 → 签到 → INSUFFICIENT_BALANCE，无记录
  const xiaohongId = await createStudentWithBalance("小红", 0)
  const noBalance = await checkInStudentAction({
    studentId: xiaohongId,
    attendanceDate: TODAY,
  })
  assert(
    noBalance.success === false &&
      noBalance.errorType === "INSUFFICIENT_BALANCE",
    "INSUFFICIENT_BALANCE"
  )
  assert((await countValidAttendance(xiaohongId)) === 0, "no attendance record")
  const listHong = await listTodayAttendanceAction({ attendanceDate: TODAY })
  if (listHong.success) {
    const row = listHong.data.find((r) => r.id === xiaohongId)
    assert(row?.lessonBalance === 0, "balance still 0")
    assert(row?.canCheckIn === false, "cannot check in")
  }
  console.log("✓ §5.3 #3 小红余额 0 → INSUFFICIENT_BALANCE")

  // §5.3 #4 — 5 名学员均可签 → 依次签到 → 5 人均已签到
  const fiveIds: string[] = []
  for (let i = 1; i <= 5; i++) {
    fiveIds.push(await createStudentWithBalance(`五人${i}`, 3))
  }
  for (const id of fiveIds) {
    const result = await checkInStudentAction({
      studentId: id,
      attendanceDate: TODAY,
    })
    assert(result.success === true, `check-in student ${id}`)
  }
  const listFive = await listTodayAttendanceAction({ attendanceDate: TODAY })
  if (listFive.success) {
    for (const id of fiveIds) {
      const row = listFive.data.find((r) => r.id === id)
      assert(row?.todayStatus === "CHECKED_IN", "all checked in")
      assert(row?.lessonBalance === 2, "balance 3→2")
      assert(row?.canCheckIn === false, "cannot check in again")
    }
  }
  console.log("✓ §5.3 #4 5 名学员依次签到成功")

  // §5.3 #5 — 小刚未到课 → 不操作 → 未签到，余额不变
  const xiaogangId = await createStudentWithBalance("小刚", 5)
  const listGang = await listTodayAttendanceAction({ attendanceDate: TODAY })
  if (listGang.success) {
    const row = listGang.data.find((r) => r.id === xiaogangId)
    assert(row?.todayStatus === "NOT_CHECKED_IN", "小刚未签到")
    assert(row?.lessonBalance === 5, "小刚余额不变")
  }
  assert((await countValidAttendance(xiaogangId)) === 0, "小刚无签到记录")
  console.log("✓ §5.3 #5 小刚未到课，余额不变")

  // §5.3 #6 — 小明余额 1 → 签到 → 成功，余额 0，不可再签
  const lastLessonId = await createStudentWithBalance("最后一节", 1)
  const lastOk = await checkInStudentAction({
    studentId: lastLessonId,
    attendanceDate: TODAY,
  })
  assert(lastOk.success === true, "last lesson check-in")
  if (lastOk.success) {
    assert(lastOk.data.lessonBalance === 0, "balance 0")
  }
  const lastDup = await checkInStudentAction({
    studentId: lastLessonId,
    attendanceDate: TODAY,
  })
  assert(
    lastDup.success === false &&
      (lastDup.errorType === "ALREADY_CHECKED_IN" ||
        lastDup.errorType === "INSUFFICIENT_BALANCE"),
    "cannot check in at 0"
  )
  const listLast = await listTodayAttendanceAction({ attendanceDate: TODAY })
  if (listLast.success) {
    const row = listLast.data.find((r) => r.id === lastLessonId)
    assert(row?.lessonBalance === 0, "list shows 0")
    assert(row?.canCheckIn === false, "cannot check in")
  }
  console.log("✓ §5.3 #6 余额 1→0，不可再签")

  // §5.3 #7 — 小明刚签到 → /students 列表余额与今日名单一致
  const studentList = await listStudentsAction()
  const attendanceList = await listTodayAttendanceAction({ attendanceDate: TODAY })
  assert(studentList.success === true, "student list")
  assert(attendanceList.success === true, "attendance list")
  if (studentList.success && attendanceList.success) {
    const attendanceRow = attendanceList.data.find((r) => r.id === xiaomingId)
    const studentRow = studentList.data.find((s) => s.id === xiaomingId)
    assert(
      attendanceRow != null && studentRow != null,
      "rows exist in both lists"
    )
    assert(
      studentRow!.lessonBalance === attendanceRow!.lessonBalance,
      "students list matches attendance list balance"
    )
  }
  const studentDetail = await getStudentAction(xiaomingId)
  if (studentDetail.success) {
    assert(studentDetail.data.lessonBalance === 7, "detail balance 7")
  }
  console.log("✓ §5.3 #7 Students 页面余额与今日名单一致")

  // §5.3 #8 — 已归档学员 → 尝试签到 → STUDENT_ARCHIVED，无记录
  const archived = await prisma.student.create({
    data: {
      name: `${TEST_PREFIX}归档`,
      contactName: "家长",
      status: "ARCHIVED",
    },
  })
  const archivedCheckIn = await checkInStudentAction({
    studentId: archived.id,
    attendanceDate: TODAY,
  })
  assert(
    archivedCheckIn.success === false &&
      archivedCheckIn.errorType === "STUDENT_ARCHIVED",
    "STUDENT_ARCHIVED"
  )
  assert((await countValidAttendance(archived.id)) === 0, "no record for archived")
  console.log("✓ §5.3 #8 已归档学员 STUDENT_ARCHIVED")

  // 附加 — 不存在学员
  const notFound = await checkInStudentAction({
    studentId: "nonexistent-cuid-id",
    attendanceDate: TODAY,
  })
  assert(
    notFound.success === false && notFound.errorType === "STUDENT_NOT_FOUND",
    "STUDENT_NOT_FOUND"
  )
  console.log("✓ 附加 STUDENT_NOT_FOUND")

  // 附加 — 部分学员签到（3 已签 / 其余未签）
  const partialA = await createStudentWithBalance("部分A", 4)
  const partialB = await createStudentWithBalance("部分B", 4)
  const partialC = await createStudentWithBalance("部分C", 4)
  const partialD = await createStudentWithBalance("部分D", 4)
  await checkInStudentAction({ studentId: partialA, attendanceDate: TODAY })
  await checkInStudentAction({ studentId: partialB, attendanceDate: TODAY })
  await checkInStudentAction({ studentId: partialC, attendanceDate: TODAY })

  const partialList = await listTodayAttendanceAction({
    attendanceDate: TODAY,
  })
  if (partialList.success) {
    const checked = [partialA, partialB, partialC].every((id) => {
      const row = partialList.data.find((r) => r.id === id)
      return row?.todayStatus === "CHECKED_IN" && row.lessonBalance === 3
    })
    const unchecked = partialList.data.find((r) => r.id === partialD)
    assert(checked, "3 checked in with balance 3")
    assert(
      unchecked?.todayStatus === "NOT_CHECKED_IN" && unchecked.lessonBalance === 4,
      "1 not checked in"
    )
  }
  console.log("✓ 附加 3 已签 / 1 未签")

  // 附加 — DB 扣课与签到一一对应
  const deductId = await createStudentWithBalance("扣课验证", 10)
  await checkInStudentAction({ studentId: deductId, attendanceDate: TODAY })
  await checkInStudentAction({ studentId: deductId, attendanceDate: TODAY }).catch(
    () => null
  )
  const deductList = await listTodayAttendanceAction({ attendanceDate: TODAY })
  const deductCount = await countValidAttendance(deductId)
  if (deductList.success) {
    const row = deductList.data.find((r) => r.id === deductId)
    assert(deductCount === 1, "1 record = 1 deduction")
    assert(row?.lessonBalance === 9, "10 - 1 = 9")
  }
  console.log("✓ 附加 1 记录 −1 余额")

  assertUiLayerCompliance()
  console.log("✓ UI layer compliance audit")

  await cleanup()
  console.log("\nAll M4 attendance acceptance tests passed.")
}

runAcceptance()
  .catch((error) => {
    console.error("\nM4 attendance acceptance failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
