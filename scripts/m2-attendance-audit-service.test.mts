/**
 * @file m2-attendance-audit-service.test.mts
 * @feature attendance
 * @purpose Sprint 7 M2：listAttendanceAudit / getAttendanceAuditTimeline + 审计
 *
 * 运行：npm run test:m2-attendance-audit
 */

import "dotenv/config"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { getAttendanceAuditTimelineAction } from "../src/features/attendance/actions/get-attendance-audit-timeline.action"
import { listAttendanceAuditAction } from "../src/features/attendance/actions/list-attendance-audit.action"
import { toAttendanceDate } from "../src/features/attendance/lib/attendance-date"
import {
  lifecycleEventLabel,
  sortLifecycleEventsAscending,
} from "../src/features/attendance/mappers/attendance-audit.mapper"
import { attendanceRepository } from "../src/features/attendance/repositories/attendance.repository"
import {
  attendanceAuditService,
  attendanceService,
} from "../src/features/attendance/services/attendance.service"
import { studentService } from "../src/features/students/services/student.service"
import { prisma } from "../src/shared/lib/db"

const TEST_PREFIX = "__m2_att_audit__"
const DAY_1 = toAttendanceDate(new Date("2026-06-01"))
const DAY_3 = toAttendanceDate(new Date("2026-06-03"))
const DAY_5 = toAttendanceDate(new Date("2026-06-05"))

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`)
}

function auditSource(filePath: string, forbiddenPatterns: RegExp[]): void {
  const source = readFileSync(join(process.cwd(), filePath), "utf8")
  for (const pattern of forbiddenPatterns) {
    assert(!pattern.test(source), `${filePath} must not match ${pattern}`)
  }
}

function assertAuditListRowShape(row: unknown): void {
  assert(typeof row === "object" && row !== null, "row is object")
  const r = row as Record<string, unknown>
  assert(typeof r.id === "string", "id")
  assert(typeof r.studentId === "string", "studentId")
  assert(typeof r.studentName === "string", "studentName")
  assert(typeof r.attendanceDate === "string", "attendanceDate")
  assert(r.status === "VALID" || r.status === "VOIDED", "status")
  assert(typeof r.checkedInAt === "string", "checkedInAt")
  assert(r.voidedAt === null || typeof r.voidedAt === "string", "voidedAt")
  assert(typeof r.eventCount === "number", "eventCount")
}

async function cleanup(): Promise<void> {
  await prisma.attendance.deleteMany({
    where: { student: { name: { startsWith: TEST_PREFIX } } },
  })
  await prisma.student.deleteMany({
    where: { name: { startsWith: TEST_PREFIX } },
  })
}

async function setupStudent(name: string) {
  const created = await studentService.createStudent({
    name: `${TEST_PREFIX}${name}`,
    contactName: "家长",
  })
  assert(created.success === true, `create ${name}`)
  if (!created.success) throw new Error("setup failed")
  return created.data.id
}

async function runTests(): Promise<void> {
  console.log("M2 Attendance Audit Service — self test\n")
  await cleanup()

  const xiaomingId = await setupStudent("小明")
  const xiaohongId = await setupStudent("小红")

  await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_1,
  })
  await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_3,
  })
  const record5 = await attendanceRepository.create({
    studentId: xiaomingId,
    attendanceDate: DAY_5,
  })
  await attendanceRepository.create({
    studentId: xiaohongId,
    attendanceDate: DAY_3,
  })

  await attendanceRepository.void(record5.id)

  // AL1 — mixed list with voidedAt / lastEventType
  const all = await attendanceService.listAttendanceAudit()
  assert(all.success === true, "list all success")
  if (all.success) {
    assert(all.data.length >= 4, "at least 4 audit rows")
    all.data.forEach(assertAuditListRowShape)
    const voided = all.data.find((r) => r.id === record5.id)
    assert(voided?.status === "VOIDED", "voided status")
    assert(typeof voided?.voidedAt === "string", "voidedAt set")
    assert(voided?.lastEventType === "VOID", "lastEventType VOID")
    assert(voided!.eventCount >= 2, "voided has CHECK_IN + VOID")
    const valid = all.data.find(
      (r) => r.studentId === xiaomingId && r.status === "VALID"
    )
    assert(valid?.lastEventType === "CHECK_IN", "valid lastEvent CHECK_IN")
  }
  console.log("✓ listAttendanceAudit (all + lastEventType)")

  // AL2 — status=VALID
  const validOnly = await attendanceService.listAttendanceAudit({
    studentId: xiaomingId,
    status: "VALID",
  })
  assert(
    validOnly.success === true &&
      validOnly.data.every((r) => r.status === "VALID"),
    "status VALID filter"
  )
  console.log("✓ listAttendanceAudit (status=VALID)")

  // AL3 — date range
  const range = await attendanceService.listAttendanceAudit({
    studentId: xiaomingId,
    dateFrom: DAY_3,
    dateTo: DAY_5,
  })
  assert(range.success === true && range.data.length === 2, "date range")
  console.log("✓ listAttendanceAudit (dateFrom/dateTo)")

  // AL4 — studentId filter
  const studentFilter = await attendanceService.listAttendanceAudit({
    studentId: xiaohongId,
  })
  assert(
    studentFilter.success === true &&
      studentFilter.data.every((r) => r.studentId === xiaohongId),
    "student filter"
  )
  console.log("✓ listAttendanceAudit (studentId)")

  // AL5 — empty filter success
  const empty = await attendanceService.listAttendanceAudit({
    studentId: xiaomingId,
    dateFrom: DAY_1,
    dateTo: DAY_1,
    status: "VOIDED",
  })
  assert(empty.success === true && empty.data.length === 0, "empty success")
  console.log("✓ listAttendanceAudit (empty)")

  const notFound = await attendanceService.listAttendanceAudit({
    studentId: "nonexistent-student-id",
  })
  assert(
    notFound.success === false && notFound.errorType === "STUDENT_NOT_FOUND",
    "STUDENT_NOT_FOUND"
  )
  console.log("✓ STUDENT_NOT_FOUND (audit filter)")

  // AT1 — check-in only timeline
  const checkInOnly = await attendanceRepository.create({
    studentId: xiaohongId,
    attendanceDate: DAY_5,
  })
  const timeline1 = await attendanceAuditService.getAttendanceAuditTimeline({
    attendanceId: checkInOnly.id,
  })
  assert(timeline1.success === true, "timeline success")
  if (timeline1.success) {
    assert(timeline1.data.events.length === 1, "1 CHECK_IN event")
    assert(timeline1.data.events[0]!.eventType === "CHECK_IN", "CHECK_IN")
    assert(timeline1.data.events[0]!.label === "签到", "label")
  }
  console.log("✓ getAttendanceAuditTimeline (CHECK_IN only)")

  // AT2 — check-in → void ascending
  const timeline2 = await attendanceService.getAttendanceAuditTimeline({
    attendanceId: record5.id,
  })
  assert(timeline2.success === true, "void timeline success")
  if (timeline2.success) {
    assert(timeline2.data.events.length >= 2, "2+ events")
    assert(
      timeline2.data.events[0]!.eventType === "CHECK_IN" &&
        timeline2.data.events[1]!.eventType === "VOID",
      "CHECK_IN → VOID order"
    )
  }
  console.log("✓ getAttendanceAuditTimeline (CHECK_IN → VOID)")

  // AT3 — restore chain
  await attendanceRepository.restore(record5.id)
  const timeline3 = await getAttendanceAuditTimelineAction({
    attendanceId: record5.id,
  })
  assert(timeline3.success === true, "restore timeline success")
  if (timeline3.success) {
    assert(timeline3.data.events.length === 3, "3 events")
    assert(
      timeline3.data.events[2]!.eventType === "RESTORE",
      "third RESTORE"
    )
    assert(timeline3.data.currentStatus === "VALID", "currentStatus VALID")
    assert(timeline3.data.events[1]!.eventType === "VOID", "VOID preserved")
  }
  console.log("✓ getAttendanceAuditTimeline (CHECK_IN → VOID → RESTORE)")

  // AT4 — not found
  const missing = await attendanceService.getAttendanceAuditTimeline({
    attendanceId: "nonexistent-attendance-id",
  })
  assert(
    missing.success === false && missing.errorType === "ATTENDANCE_NOT_FOUND",
    "ATTENDANCE_NOT_FOUND"
  )
  console.log("✓ ATTENDANCE_NOT_FOUND (timeline)")

  // AT5 — VOID event preserved after restore (covered above)

  // Mapper purity
  assert(lifecycleEventLabel("RESTORE") === "恢复", "label restore")
  const unsorted = [
    {
      id: "1",
      attendanceId: "a",
      studentId: "s",
      eventType: "RESTORE" as const,
      occurredAt: new Date("2026-06-05T12:00:00Z"),
      operatorId: null,
      metadata: null,
      createdAt: new Date(),
    },
    {
      id: "2",
      attendanceId: "a",
      studentId: "s",
      eventType: "CHECK_IN" as const,
      occurredAt: new Date("2026-06-05T10:00:00Z"),
      operatorId: null,
      metadata: null,
      createdAt: new Date(),
    },
  ]
  const sorted = sortLifecycleEventsAscending(unsorted)
  assert(sorted[0]!.eventType === "CHECK_IN", "mapper sort ascending")
  console.log("✓ audit mapper sort + label")

  auditSource("src/features/attendance/mappers/attendance-audit.mapper.ts", [
    /attendanceRepository/,
    /studentService/,
    /prisma/,
  ])
  console.log("✓ attendance-audit.mapper purity")

  auditSource("src/features/attendance/services/attendance.service.ts", [
    /studentService/,
  ])
  console.log("✓ audit service no studentService")

  auditSource("src/features/attendance/actions/list-attendance-audit.action.ts", [
    /attendanceRepository/,
    /Repository/,
  ])
  auditSource(
    "src/features/attendance/actions/get-attendance-audit-timeline.action.ts",
    [/attendanceRepository/, /Repository/]
  )
  console.log("✓ audit actions service-only")

  await cleanup()
  console.log("\nAll M2 attendance audit service tests passed.")
}

runTests()
  .catch((error) => {
    console.error("\nM2 attendance audit test failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
