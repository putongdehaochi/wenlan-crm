"use server"

import { attendanceService } from "@/features/attendance/services/attendance.service"
import type { BatchCheckInInput } from "@/features/attendance/types/check-in-input.type"
import type { BatchCheckInResult } from "@/features/attendance/types/batch-check-in-result.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function batchCheckInStudentsAction(
  input: BatchCheckInInput
): Promise<AttendanceActionResult<BatchCheckInResult>> {
  return attendanceService.batchCheckInStudents(input)
}
