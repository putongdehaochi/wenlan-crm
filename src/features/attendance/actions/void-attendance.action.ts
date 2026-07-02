/**
 * @file void-attendance.action.ts
 * @feature attendance
 * @purpose 撤销签到；仅调用 Service
 */

"use server"

import { attendanceService } from "@/features/attendance/services/attendance.service"
import type { VoidAttendanceInput } from "@/features/attendance/types/void-attendance-input.type"
import type { VoidAttendanceResult } from "@/features/attendance/types/void-attendance-result.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function voidAttendanceAction(
  input: VoidAttendanceInput
): Promise<AttendanceActionResult<VoidAttendanceResult>> {
  return attendanceService.voidAttendance(input)
}
