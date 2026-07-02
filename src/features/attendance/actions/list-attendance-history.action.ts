/**
 * @file list-attendance-history.action.ts
 * @feature attendance
 * @purpose 签到历史列表；仅调用 Service
 */

"use server"

import { attendanceService } from "@/features/attendance/services/attendance.service"
import type { AttendanceHistoryRow } from "@/features/attendance/types/attendance-history-row.type"
import type { FindHistoryInput } from "@/features/attendance/types/find-history-input.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function listAttendanceHistoryAction(
  input: FindHistoryInput = {}
): Promise<AttendanceActionResult<AttendanceHistoryRow[]>> {
  return attendanceService.listAttendanceHistory(input)
}
