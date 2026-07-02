/**
 * @file void-attendance.validator.ts
 * @feature attendance
 * @purpose 撤销签到入参校验；仅 id 格式与 normalize，不判断存在性或 VOIDED
 */

import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import type { VoidAttendanceInput } from "@/features/attendance/types/void-attendance-input.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/attendance/validators/validation-result.type"

export type ValidatedVoidAttendanceInput = {
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

export function validateVoidAttendanceInput(
  input: VoidAttendanceInput
): ValidationResult<ValidatedVoidAttendanceInput> {
  const fieldErrors = mergeFieldErrors(
    collectFieldError(
      "attendanceId",
      validateAttendanceId(input.attendanceId)
    )
  )

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

function collectFieldError(
  field: string,
  error: string | null
): Record<string, string> {
  return error ? { [field]: error } : {}
}
