/**
 * @file attendance-history.mapper.ts
 * @feature attendance
 * @purpose AttendanceEntity + StudentEntity → AttendanceHistoryRow / VoidAttendanceResult
 *
 * 禁止：Repository 调用 · Service 调用 · 余额计算
 */

import type { AttendanceEntity } from "@/features/attendance/types/attendance-entity.type"
import type { AttendanceHistoryRow } from "@/features/attendance/types/attendance-history-row.type"
import type { RestoreAttendanceResult } from "@/features/attendance/types/restore-attendance-result.type"
import type { VoidAttendanceResult } from "@/features/attendance/types/void-attendance-result.type"
import type { StudentEntity } from "@/features/students/types/student-entity.type"

function formatAttendanceDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function toAttendanceHistoryRow(
  entity: AttendanceEntity,
  student: StudentEntity | undefined,
  teacherName?: string
): AttendanceHistoryRow {
  return {
    id: entity.id,
    studentId: entity.studentId,
    studentName: student?.name ?? "未知学员",
    attendanceDate: formatAttendanceDate(entity.attendanceDate),
    quantityConsumed: entity.status === "VALID" ? 1 : 0,
    status: entity.status,
    checkedInAt: entity.createdAt.toISOString(),
    voidedAt: entity.voidedAt ? entity.voidedAt.toISOString() : null,
    canVoid: entity.status === "VALID",
    canRestore: entity.status === "VOIDED",
    teacherName,
  }
}

export function toAttendanceHistoryRowList(
  entities: AttendanceEntity[],
  studentMap: Map<string, StudentEntity>,
  teacherNameMap: Map<string, string>
): AttendanceHistoryRow[] {
  return entities.map((entity) =>
    toAttendanceHistoryRow(
      entity,
      studentMap.get(entity.studentId),
      teacherNameMap.get(entity.teacherId)
    )
  )
}

export function toVoidAttendanceResult(
  entity: AttendanceEntity,
  lessonBalance: number
): VoidAttendanceResult {
  return {
    attendanceId: entity.id,
    studentId: entity.studentId,
    attendanceDate: formatAttendanceDate(entity.attendanceDate),
    status: "VOIDED",
    lessonBalance,
  }
}

export function toRestoreAttendanceResult(
  entity: AttendanceEntity,
  lessonBalance: number
): RestoreAttendanceResult {
  return {
    attendanceId: entity.id,
    studentId: entity.studentId,
    attendanceDate: formatAttendanceDate(entity.attendanceDate),
    status: "VALID",
    lessonBalance,
    checkedInAt: entity.createdAt.toISOString(),
  }
}
