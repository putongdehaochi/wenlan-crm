/**
 * @file check-in-student.action.ts
 * @feature attendance
 * @purpose 学员签到；仅调用 Service
 */

"use server"

import { attendanceService } from "@/features/attendance/services/attendance.service"
import type { CheckInInput } from "@/features/attendance/types/check-in-input.type"
import type { CheckInResult } from "@/features/attendance/types/check-in-result.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function checkInStudentAction(
  input: CheckInInput
): Promise<AttendanceActionResult<CheckInResult>> {
  return attendanceService.checkInStudent(input)
}
