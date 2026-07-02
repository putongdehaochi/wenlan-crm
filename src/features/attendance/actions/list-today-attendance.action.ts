/**
 * @file list-today-attendance.action.ts
 * @feature attendance
 * @purpose 加载今日签到名单；仅调用 Service
 */

"use server"

import { attendanceService } from "@/features/attendance/services/attendance.service"
import type { AttendanceTodayRow } from "@/features/attendance/types/attendance-today-row.type"
import type { ListTodayAttendanceInput } from "@/features/attendance/types/check-in-input.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function listTodayAttendanceAction(
  input: ListTodayAttendanceInput = {}
): Promise<AttendanceActionResult<AttendanceTodayRow[]>> {
  return attendanceService.listTodayAttendance(input)
}
