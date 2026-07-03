/**
 * @file restore-attendance.validator.ts
 * @feature attendance
 * @purpose 恢复签到入参校验；仅 id 格式与 normalize，不判断存在性或 VALID
 */

import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import type { RestoreAttendanceInput } from "@/features/attendance/types/restore-attendance-input.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/attendance/validators/validation-result.type"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"

export type ValidatedRestoreAttendanceInput = {
  attendanceId: string
  teacherId?: string
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

export function validateRestoreAttendanceInput(
  input: RestoreAttendanceInput
): ValidationResult<ValidatedRestoreAttendanceInput> {
  const fieldErrors = mergeFieldErrors(
    collectFieldError(
      "attendanceId",
      validateAttendanceId(input.attendanceId)
    )
  )

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  let teacherId: string | undefined
  if (input.teacherId !== undefined && input.teacherId !== "") {
    const teacherIdError = validateStudentId(
      input.teacherId,
      ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED
    )
    if (teacherIdError) {
      fieldErrors.teacherId = teacherIdError
    } else {
      teacherId = (input.teacherId as string).trim()
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  return {
    success: true,
    data: {
      attendanceId: (input.attendanceId as string).trim(),
      teacherId,
    },
  }
}

function collectFieldError(
  field: string,
  error: string | null
): Record<string, string> {
  return error ? { [field]: error } : {}
}
