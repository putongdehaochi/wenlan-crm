/**
 * @file restore-attendance.action.ts
 * @feature attendance
 * @purpose 恢复签到；仅调用 Service
 */

"use server"

import { attendanceService } from "@/features/attendance/services/attendance.service"
import type { RestoreAttendanceInput } from "@/features/attendance/types/restore-attendance-input.type"
import type { RestoreAttendanceResult } from "@/features/attendance/types/restore-attendance-result.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function restoreAttendanceAction(
  input: RestoreAttendanceInput
): Promise<AttendanceActionResult<RestoreAttendanceResult>> {
  return attendanceService.restoreAttendance(input)
}
