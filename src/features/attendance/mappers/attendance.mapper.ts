/**
 * @file attendance.mapper.ts
 * @feature attendance
 * @purpose Entity / StudentEntity → ViewModel 映射
 */

import type { AttendanceEntity } from "@/features/attendance/types/attendance-entity.type"
import type {
  AttendanceTodayRow,
  AttendanceTodayStatus,
  TodayAttendanceDetail,
} from "@/features/attendance/types/attendance-today-row.type"
import type { CheckInResult } from "@/features/attendance/types/check-in-result.type"
import type { StudentEntity } from "@/features/students/types/student-entity.type"

export function toTodayRow(
  entity: StudentEntity,
  lessonBalance: number,
  detail?: TodayAttendanceDetail
): AttendanceTodayRow {
  let todayStatus: AttendanceTodayStatus = "NOT_CHECKED_IN"
  if (detail?.status === "VALID") {
    todayStatus = "CHECKED_IN"
  } else if (detail?.status === "VOIDED") {
    todayStatus = "VOIDED"
  }

  const voidedAttendanceId =
    detail?.status === "VOIDED" ? detail.attendanceId : undefined

  const canRestore =
    todayStatus === "VOIDED" &&
    entity.status === "ACTIVE" &&
    lessonBalance >= 1 &&
    Boolean(voidedAttendanceId)
  const canCheckIn =
    todayStatus === "NOT_CHECKED_IN" &&
    entity.status === "ACTIVE" &&
    lessonBalance >= 1

  return {
    id: entity.id,
    name: entity.name,
    lessonBalance,
    todayStatus,
    canCheckIn,
    canRestore,
    checkedInAt: detail?.checkedInAt.toISOString() ?? null,
    voidedAt: detail?.voidedAt?.toISOString() ?? null,
    teacherName: detail?.teacherName ?? null,
    ...(voidedAttendanceId ? { attendanceId: voidedAttendanceId } : {}),
  }
}

export function toTodayRowList(
  entities: StudentEntity[],
  balanceMap: Map<string, number>,
  detailsMap: Map<string, TodayAttendanceDetail>
): AttendanceTodayRow[] {
  return entities.map((entity) =>
    toTodayRow(
      entity,
      balanceMap.get(entity.id) ?? 0,
      detailsMap.get(entity.id)
    )
  )
}

export function toCheckInResult(
  entity: AttendanceEntity,
  lessonBalance: number
): CheckInResult {
  return {
    attendanceId: entity.id,
    studentId: entity.studentId,
    attendanceDate: entity.attendanceDate,
    lessonBalance,
    todayStatus: "CHECKED_IN",
  }
}
