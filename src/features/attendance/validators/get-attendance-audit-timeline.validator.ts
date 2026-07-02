/**
 * @file get-attendance-audit-timeline.validator.ts
 * @feature attendance
 * @purpose Timeline 入参校验；不判断签到是否存在
 */

import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import type { GetAttendanceAuditTimelineInput } from "@/features/attendance/types/get-attendance-audit-timeline-input.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/attendance/validators/validation-result.type"

export type ValidatedGetAttendanceAuditTimelineInput = {
  attendanceId: string
}

function validateAttendanceId(value: unknown): string | null {
  if (typeof value !== "string") {
    return ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_ID_REQUIRED
  }
  if (value.trim().length < 1) {
    return ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_ID_REQUIRED
  }
  return null
}

export function validateGetAttendanceAuditTimelineInput(
  input: GetAttendanceAuditTimelineInput
): ValidationResult<ValidatedGetAttendanceAuditTimelineInput> {
  const fieldErrors = mergeFieldErrors()
  const attendanceIdError = validateAttendanceId(input.attendanceId)
  if (attendanceIdError) {
    fieldErrors.attendanceId = attendanceIdError
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  return {
    success: true,
    data: {
      attendanceId: (input.attendanceId as string).trim(),
    },
  }
}
