/**
 * @file check-in-result.type.ts
 * @feature attendance
 * @purpose 签到成功返回 ViewModel
 */

import type { AttendanceTodayStatus } from "@/features/attendance/types/attendance-today-row.type"

export type CheckInResult = {
  attendanceId: string
  studentId: string
  attendanceDate: Date
  lessonBalance: number
  todayStatus: AttendanceTodayStatus
}
