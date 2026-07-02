/**
 * @file check-in.validator.ts
 * @feature attendance
 * @purpose Check In 入参校验；由 Service 调用
 */

import { toAttendanceDate } from "@/features/attendance/lib/attendance-date"
import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import type { CheckInInput } from "@/features/attendance/types/check-in-input.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/attendance/validators/validation-result.type"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"

export type ValidatedCheckInInput = {
  studentId: string
  attendanceDate: Date
}

function parseAttendanceDate(value: unknown): Date | null {
  if (value == null || value === "") {
    return toAttendanceDate()
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return toAttendanceDate(value)
  }
  if (typeof value === "string") {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return toAttendanceDate(parsed)
  }
  return null
}

export function validateCheckInInput(
  input: CheckInInput
): ValidationResult<ValidatedCheckInInput> {
  const fieldErrors = mergeFieldErrors(
    collectFieldError(
      "studentId",
      validateStudentId(
        input.studentId,
        ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED
      )
    )
  )

  const attendanceDate = parseAttendanceDate(input.attendanceDate)
  if (!attendanceDate) {
    fieldErrors.attendanceDate = ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_DATE_INVALID
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  return {
    success: true,
    data: {
      studentId: (input.studentId as string).trim(),
      attendanceDate: attendanceDate!,
    },
  }
}

export function validateListTodayAttendanceDate(
  attendanceDate?: Date | string
): ValidationResult<Date> {
  const parsed = parseAttendanceDate(attendanceDate)
  if (!parsed) {
    return {
      success: false,
      fieldErrors: {
        attendanceDate: ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_DATE_INVALID,
      },
    }
  }
  return { success: true, data: parsed }
}

function collectFieldError(
  field: string,
  error: string | null
): Record<string, string> {
  return error ? { [field]: error } : {}
}
