/**
 * @file list-attendance-history.validator.ts
 * @feature attendance
 * @purpose 历史列表入参校验；不判断学员是否存在
 */

import { toAttendanceDate } from "@/features/attendance/lib/attendance-date"
import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import type { FindHistoryInput } from "@/features/attendance/types/find-history-input.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/attendance/validators/validation-result.type"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"

function parseHistoryDate(value: unknown): Date | null {
  if (value == null || value === "") {
    return null
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

export function validateListAttendanceHistoryInput(
  input: FindHistoryInput = {}
): ValidationResult<FindHistoryInput> {
  const fieldErrors = mergeFieldErrors()

  if (input.studentId !== undefined) {
    const studentIdError = validateStudentId(
      input.studentId,
      ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED
    )
    if (studentIdError) {
      fieldErrors.studentId = studentIdError
    }
  }

  if (input.limit !== undefined) {
    if (
      typeof input.limit !== "number" ||
      !Number.isInteger(input.limit) ||
      input.limit < 1
    ) {
      fieldErrors.limit = ATTENDANCE_ERROR_MESSAGES.HISTORY_LIMIT_INVALID
    }
  }

  let dateFrom: Date | undefined
  let dateTo: Date | undefined

  if (input.dateFrom !== undefined) {
    const parsed = parseHistoryDate(input.dateFrom)
    if (!parsed) {
      fieldErrors.dateFrom = ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_DATE_INVALID
    } else {
      dateFrom = parsed
    }
  }

  if (input.dateTo !== undefined) {
    const parsed = parseHistoryDate(input.dateTo)
    if (!parsed) {
      fieldErrors.dateTo = ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_DATE_INVALID
    } else {
      dateTo = parsed
    }
  }

  if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
    fieldErrors.dateFrom = ATTENDANCE_ERROR_MESSAGES.HISTORY_DATE_RANGE_INVALID
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  const data: FindHistoryInput = {}
  if (input.studentId !== undefined) {
    data.studentId = (input.studentId as string).trim()
  }
  if (input.limit !== undefined) {
    data.limit = input.limit
  }
  if (dateFrom) {
    data.dateFrom = dateFrom
  }
  if (dateTo) {
    data.dateTo = dateTo
  }

  return { success: true, data }
}
