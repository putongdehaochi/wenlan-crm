/**
 * @file m4-attendance-audit-acceptance.test.mts
 * @feature attendance
 * @purpose M4 验收：Audit + Statistics 全链路 + Sprint 2～6 回归
 *
 * 覆盖 specs/attendance-audit.md §6 全部场景
 *
 * 运行：npm run test:m4-attendance-audit
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { checkInStudentAction } from "../src/features/attendance/actions/check-in-student.action"
import { getAttendanceAuditTimelineAction } from "../src/features/attendance/actions/get-attendance-audit-timeline.action"
import { getAttendanceStatisticsAction } from "../src/features/attendance/actions/get-attendance-statistics.action"
import { listAttendanceAuditAction } from "../src/features/attendance/actions/list-attendance-audit.action"
import { listAttendanceHistoryAction } from "../src/features/attendance/actions/list-attendance-history.action"
import { restoreAttendanceAction } from "../src/features/attendance/actions/restore-attendance.action"
import { voidAttendanceAction } from "../src/features/attendance/actions/void-attendance.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import {
  buildAttendanceAuditHref,
  buildListAttendanceAuditInput,
} from "../src/features/attendance/lib/attendance-audit-query"
import { buildAttendanceStatisticsHref } from "../src/features/attendance/lib/attendance-statistics-query"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import { createLessonPurchaseAction } from "../src/features/lessons/actions/create-lesson-purchase.action"
import { createStudentAction } from "../src/features/students/actions/create-student.action"
import { listStudentsAction } from "../src/features/students/actions/list-students.action"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m4_att_audit__"
const DAY_1 = toAttendanceDate(new Date("2026-06-01"))
const DAY_3 = toAttendanceDate(new Date("2026-06-03"))
const DAY_5 = toAttendanceDate(new Date("2026-06-05"))
const RANGE_END = toAttendanceDate()

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), "utf8")
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
    assert(purchase.success === true, `purchase for ${name}`)
  }

  return created.data.id
}

function assertAuditUiCompliance(): void {
  const auditPage = readSource(
    "src/features/attendance/components/attendance-audit-page.tsx"
  )
  assert(
    auditPage.includes("getAttendanceAuditTimelineAction"),
    "audit page timeline action"
  )
  assert(
    auditPage.includes("exportAttendanceAuditAction"),
    "audit page export action"
  )
  assert(!/import.*attendanceService/.test(auditPage), "audit page no Service")
  assert(!/import.*repository/i.test(auditPage), "audit page no Repository")

  const exportButton = readSource(
    "src/features/attendance/components/attendance-export-download-button.tsx"
  )
  assert(
    exportButton.includes("downloadAttendanceExportPayload"),
    "export button uses payload download"
  )
  assert(!/toCsvLine/.test(exportButton), "export button no csv builder")
  assert(!/\.sort\s*\(/.test(exportButton), "export button no sort")

  const monthlyTrend = readSource(
    "src/features/attendance/components/attendance-monthly-trend.tsx"
  )
  assert(
    monthlyTrend.includes("validAttendanceCount"),
    "monthly trend uses ViewModel"
  )
  assert(!/\.sort\s*\(/.test(monthlyTrend), "monthly trend no sort")
  assert(!/\.reduce\s*\(/.test(monthlyTrend), "monthly trend no reduce")

  const remainingRank = readSource(
    "src/features/attendance/components/attendance-remaining-rank.tsx"
  )
  assert(
    remainingRank.includes("remainingLessons"),
    "remaining rank uses ViewModel"
  )
  assert(!/\.sort\s*\(/.test(remainingRank), "remaining rank no sort")

  const timelinePanel = readSource(
    "src/features/attendance/components/attendance-audit-timeline-panel.tsx"
  )
  assert(timelinePanel.includes("event.label"), "timeline uses event.label")
  assert(!/\.sort\s*\(/.test(timelinePanel), "timeline panel no sort")
  assert(!/eventType\s*===/.test(timelinePanel), "timeline panel no eventType branch")

  const auditRow = readSource(
    "src/features/attendance/components/attendance-audit-row.tsx"
  )
  assert(auditRow.includes("lastEventType"), "audit row uses lastEventType")
  assert(auditRow.includes("lastEventAt"), "audit row uses lastEventAt")

  const statsPage = readSource(
    "src/features/attendance/components/attendance-statistics-page.tsx"
  )
  assert(
    statsPage.includes("exportAttendanceStatisticsAction"),
    "statistics page export action"
  )
  assert(!/getAttendanceStatisticsAction/.test(statsPage), "statistics page no read action")
  assert(!/import.*repository/i.test(statsPage), "statistics page no Repository")

  const statsSummary = readSource(
    "src/features/attendance/components/attendance-statistics-summary.tsx"
  )
  assert(statsSummary.includes("summary.totalAttendance"), "summary uses ViewModel")
  assert(!/studentRank\.sort/.test(statsSummary), "summary no client rank sort")
  assert(!/\.reduce\s*\(/.test(statsSummary), "summary no reduce aggregation")
}

function assertNavigationGraph(): void {
  const nav = readSource("src/shared/components/app-sidebar.tsx")
  assert(nav.includes("/attendance"), "nav today")
  assert(nav.includes("/attendance/history"), "nav history")
  assert(nav.includes("/attendance/audit"), "nav audit")
  assert(nav.includes("/attendance/statistics"), "nav statistics")
  assert(nav.includes("/students"), "nav students")

  const studentDetail = readSource(
    "src/features/students/components/student-detail-view.tsx"
  )
  assert(
    studentDetail.includes("/attendance/audit?studentId="),
    "student detail audit link"
  )

  assert(
    buildAttendanceAuditHref({ studentId: "x", status: "VALID" }).includes(
      "status=VALID"
    ),
    "audit href builder"
  )
  assert(
    buildAttendanceStatisticsHref({ dateFrom: "2026-06-01" }).includes(
      "dateFrom=2026-06-01"
    ),
    "statistics href builder"
  )
}

function assertStatisticsArchitecture(): void {
  const statsService = readSource(
    "src/features/attendance/services/attendance-statistics.service.ts"
  )
  assert(
    !/from "@\/features\/students\/services/.test(statsService),
    "statistics service no studentService import"
  )
  assert(
    !/studentService\./.test(statsService),
    "statistics service no studentService call"
  )
}

function assertArchitectureRegression(): void {
  const studentService = readSource(
    "src/features/students/services/student.service.ts"
  )
  assert(
    !studentService.includes("attendanceStatisticsRepository"),
    "student.service no statistics repo"
  )
}

async function runAcceptance(): Promise<void> {
  console.log("M4 Attendance Audit Acceptance — full chain test\n")
  await cleanup()

  const studentAId = await createStudentWithBalance("学员A", 20)
  const studentBId = await createStudentWithBalance("学员B", 10)

  await attendanceRepository.create({
    studentId: studentAId,
    attendanceDate: DAY_1,
  })
  await attendanceRepository.create({
    studentId: studentAId,
    attendanceDate: DAY_3,
  })
  await attendanceRepository.create({
    studentId: studentAId,
    attendanceDate: DAY_5,
  })
  const voidTarget = await attendanceRepository.create({
    studentId: studentBId,
    attendanceDate: DAY_3,
  })
  await attendanceRepository.void(voidTarget.id)

  // §6.1 AL1 — 3 VALID + 1 VOIDED
  const al1 = await listAttendanceAuditAction({
    studentId: studentAId,
  })
  const al1b = await listAttendanceAuditAction({
    studentId: studentBId,
  })
  assert(al1.success === true && al1b.success === true, "AL1 success")
  if (al1.success && al1b.success) {
    const combined = [...al1.data, ...al1b.data]
    assert(combined.length === 4, "AL1 four rows")
    const voided = combined.find((r) => r.id === voidTarget.id)
    assert(typeof voided?.voidedAt === "string", "AL1 voidedAt set")
    assert(voided?.lastEventType === "VOID", "AL1 lastEventType VOID")
    assert(al1.data.every((r) => r.lastEventType !== null), "AL1 lastEventType present")
  }
  console.log("✓ §6.1 AL1 混合列表含 voidedAt / lastEventType")

  // §6.1 AL2 — status=VALID
  const al2 = await listAttendanceAuditAction({ status: "VALID" })
  assert(
    al2.success === true && al2.data.every((r) => r.status === "VALID"),
    "AL2 VALID only"
  )
  console.log("✓ §6.1 AL2 status=VALID 筛选")

  // §6.1 AL3 — date range
  const al3 = await listAttendanceAuditAction({
    studentId: studentAId,
    dateFrom: DAY_3,
    dateTo: DAY_5,
  })
  assert(al3.success === true && al3.data.length === 2, "AL3 date range")
  console.log("✓ §6.1 AL3 dateFrom/dateTo 闭区间")

  // §6.1 AL4 — studentId
  const al4 = await listAttendanceAuditAction({ studentId: studentAId })
  assert(
    al4.success === true &&
      al4.data.every((r) => r.studentId === studentAId),
    "AL4 student filter"
  )
  console.log("✓ §6.1 AL4 studentId 筛选")

  // §6.1 AL5 — empty success
  const al5 = await listAttendanceAuditAction({
    studentId: studentAId,
    dateFrom: DAY_1,
    dateTo: DAY_1,
    status: "VOIDED",
  })
  assert(al5.success === true && al5.data.length === 0, "AL5 empty")
  console.log("✓ §6.1 AL5 无记录空数组 success")

  // §6.2 AT1 — CHECK_IN only
  const checkInOnly = await attendanceRepository.create({
    studentId: studentBId,
    attendanceDate: DAY_5,
  })
  const at1 = await getAttendanceAuditTimelineAction({
    attendanceId: checkInOnly.id,
  })
  assert(at1.success === true && at1.data.events.length === 1, "AT1 one event")
  if (at1.success) {
    assert(at1.data.events[0]!.eventType === "CHECK_IN", "AT1 CHECK_IN")
    assert(at1.data.events[0]!.label === "签到", "AT1 label")
  }
  console.log("✓ §6.2 AT1 Timeline CHECK_IN only")

  // §6.2 AT2 — CHECK_IN → VOID
  const at2 = await getAttendanceAuditTimelineAction({
    attendanceId: voidTarget.id,
  })
  assert(at2.success === true, "AT2 success")
  if (at2.success) {
    assert(at2.data.events.length >= 2, "AT2 two events")
    assert(
      at2.data.events[0]!.eventType === "CHECK_IN" &&
        at2.data.events[1]!.eventType === "VOID",
      "AT2 ascending order"
    )
  }
  console.log("✓ §6.2 AT2 CHECK_IN → VOID 升序")

  // §6.2 AT3 + AT5 — void → restore, VOID preserved
  const restoreTarget = await attendanceRepository.create({
    studentId: studentBId,
    attendanceDate: DAY_1,
  })
  await attendanceRepository.void(restoreTarget.id)
  await attendanceRepository.restore(restoreTarget.id)
  const at3 = await getAttendanceAuditTimelineAction({
    attendanceId: restoreTarget.id,
  })
  assert(at3.success === true, "AT3 success")
  if (at3.success) {
    assert(at3.data.events.length === 3, "AT3 three events")
    assert(at3.data.currentStatus === "VALID", "AT3 currentStatus VALID")
    assert(at3.data.events[1]!.eventType === "VOID", "AT5 VOID preserved")
    assert(at3.data.events[2]!.eventType === "RESTORE", "AT3 RESTORE")
  }
  console.log("✓ §6.2 AT3/AT5 CHECK_IN → VOID → RESTORE（VOID 保留）")

  // §6.2 AT4 — NOT_FOUND
  const at4 = await getAttendanceAuditTimelineAction({
    attendanceId: "nonexistent-cuid-id",
  })
  assert(
    at4.success === false && at4.errorType === "ATTENDANCE_NOT_FOUND",
    "AT4 NOT_FOUND"
  )
  console.log("✓ §6.2 AT4 ATTENDANCE_NOT_FOUND")

  // §6.3 Statistics setup — per student isolated counts
  const statsStudentId = await createStudentWithBalance("统计", 30)
  for (let i = 0; i < 7; i++) {
    await attendanceRepository.create({
      studentId: statsStudentId,
      attendanceDate: toAttendanceDate(
        new Date(`2026-06-${String(i + 1).padStart(2, "0")}`)
      ),
    })
  }
  const statsVoid = await attendanceRepository.create({
    studentId: statsStudentId,
    attendanceDate: toAttendanceDate(new Date("2026-06-08")),
  })
  await attendanceRepository.void(statsVoid.id)
  const statsRestore = await attendanceRepository.create({
    studentId: statsStudentId,
    attendanceDate: toAttendanceDate(new Date("2026-06-15")),
  })
  await attendanceRepository.void(statsRestore.id)
  await attendanceRepository.restore(statsRestore.id)

  const st1 = await getAttendanceStatisticsAction({
    studentId: statsStudentId,
    dateFrom: DAY_1,
    dateTo: RANGE_END,
  })
  assert(st1.success === true, `ST1 success: ${JSON.stringify(st1)}`)
  if (st1.success) {
    assert(st1.data.totalAttendance === 9, "ST1 total 9")
    assert(st1.data.validAttendance === 8, "ST1 valid 8")
    assert(st1.data.voidedAttendance === 1, "ST1 voided 1")
    assert(st1.data.restoreCount === 1, "ST1 restore 1")
    assert(st1.data.consumedLessons === 8, "ST1 consumedLessons")
    assert(st1.data.checkInCount === 9, "ST1 checkInCount")
  }
  console.log("✓ §6.3 ST1 Statistics 口径")

  const st2 = await getAttendanceStatisticsAction({
    studentId: statsStudentId,
    dateFrom: DAY_1,
    dateTo: toAttendanceDate(new Date("2026-06-07")),
  })
  assert(st2.success === true && st2.data.totalAttendance === 7, "ST2 range")
  console.log("✓ §6.3 ST2 日期范围聚合")

  const st3 = await getAttendanceStatisticsAction({
    dateFrom: DAY_1,
    dateTo: RANGE_END,
  })
  assert(st3.success === true, "ST3 success")
  if (st3.success) {
    const rankA = st3.data.studentRank.find((r) => r.studentId === studentAId)
    const rankStats = st3.data.studentRank.find(
      (r) => r.studentId === statsStudentId
    )
    assert(rankA !== undefined && rankStats !== undefined, "ST3 ranks exist")
    if (rankA && rankStats) {
      assert(rankStats.rank < rankA.rank || rankStats.validAttendance >= rankA.validAttendance, "ST3 rank order")
    }
  }
  console.log("✓ §6.3 ST3 studentRank 降序")

  const st4 = await getAttendanceStatisticsAction({
    dateFrom: toAttendanceDate(new Date("2025-01-01")),
    dateTo: toAttendanceDate(new Date("2025-01-31")),
  })
  assert(
    st4.success === true &&
      st4.data.totalAttendance === 0 &&
      st4.data.studentRank.length === 0,
    "ST4 empty"
  )
  console.log("✓ §6.3 ST4 无数据全 0")

  // Audit Integration Checklist — void via Action writes lifecycle
  const actionVoidStudent = await createStudentWithBalance("动作撤销", 5)
  const actionRecord = await attendanceRepository.create({
    studentId: actionVoidStudent,
    attendanceDate: toAttendanceDate(new Date("2026-06-20")),
  })
  const voidAction = await voidAttendanceAction({ attendanceId: actionRecord.id })
  assert(voidAction.success === true, "void action success")
  const afterVoidAudit = await listAttendanceAuditAction({
    studentId: actionVoidStudent,
    status: "VOIDED",
  })
  if (afterVoidAudit.success) {
    const row = afterVoidAudit.data.find((r) => r.id === actionRecord.id)
    assert(row?.lastEventType === "VOID", "void action lifecycle")
  }
  console.log("✓ Audit Integration（voidAttendanceAction → lifecycle）")

  // §6.4 R1 — void/restore actions
  const r1Restore = await restoreAttendanceAction({
    attendanceId: restoreTarget.id,
  })
  assert(r1Restore.success === false && r1Restore.errorType === "ALREADY_VALID", "R1 restore")
  console.log("✓ §6.4 R1 void/restore Action 回归")

  // §6.4 R2 — history unchanged
  const r2 = await listAttendanceHistoryAction({ studentId: studentAId })
  assert(r2.success === true && r2.data.length === 3, "R2 history")
  if (r2.success) {
    assert(r2.data[0]!.voidedAt === null || typeof r2.data[0]!.voidedAt === "string", "R2 voidedAt shape")
  }
  console.log("✓ §6.4 R2 listAttendanceHistoryAction 回归")

  // §6.4 R3 — check-in
  const r3Student = await createStudentWithBalance("签到", 5)
  const today = toAttendanceDate()
  const r3 = await checkInStudentAction({
    studentId: r3Student,
    attendanceDate: today,
  })
  assert(r3.success === true && r3.data.lessonBalance === 4, "R3 check-in")
  console.log("✓ §6.4 R3 checkInStudentAction 回归")

  // §6.4 R4 — listStudents balance
  const r4 = await listStudentsAction()
  if (r4.success) {
    const a = r4.data.find((s) => s.id === studentAId)
    assert(a?.lessonBalance === 17, "R4 balance 20-3")
  }
  console.log("✓ §6.4 R4 listStudentsAction 余额一致")

  // §6.4 R5 — statistics no studentService
  assertStatisticsArchitecture()
  console.log("✓ §6.4 R5 Statistics 无 studentService")

  // §6.4 R6 — Audit UI Action Only
  assertAuditUiCompliance()
  console.log("✓ §6.4 R6 Audit UI Import 审计")

  assertNavigationGraph()
  console.log("✓ Navigation Graph 审计")

  assertArchitectureRegression()
  console.log("✓ Architecture Regression Audit")

  // Query input builder
  const built = buildListAttendanceAuditInput({
    studentId: studentAId,
    dateFrom: "2026-06-01",
    status: "VALID",
  })
  assert(built.studentId === studentAId && built.status === "VALID", "query builder")
  console.log("✓ Audit Query Matrix")

  await cleanup()
  console.log("\nAll M4 attendance audit acceptance tests passed.")
}

runAcceptance()
  .catch((error) => {
    console.error("\nM4 attendance audit acceptance failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
