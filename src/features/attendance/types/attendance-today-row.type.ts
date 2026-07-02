/**
 * @file attendance-today-row.type.ts
 * @feature attendance
 * @purpose 今日签到名单 ViewModel
 */

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"

export type AttendanceTodayStatus =
  | "NOT_CHECKED_IN"
  | "CHECKED_IN"
  | "VOIDED"

export type TodayAttendanceDetail = {
  attendanceId: string
  status: AttendanceStatus
  checkedInAt: Date
  voidedAt: Date | null
}

export type AttendanceTodayRow = {
  id: string
  name: string
  lessonBalance: number
  todayStatus: AttendanceTodayStatus
  canCheckIn: boolean
  canRestore: boolean
  attendanceId?: string
  checkedInAt?: string | null
  voidedAt?: string | null
}
