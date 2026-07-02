/**
 * @file get-attendance-statistics.validator.ts
 * @feature attendance
 * @purpose 统计入参校验与 normalize；不判断学员是否存在
 */

import { toAttendanceDate } from "@/features/attendance/lib/attendance-date"
import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import type { FindStatisticsInput } from "@/features/attendance/types/find-statistics-input.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/attendance/validators/validation-result.type"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"

const DEFAULT_RANKING_LIMIT = 10

function parseStatisticsDate(value: unknown): Date | null {
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

function formatStatisticsDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export type ValidatedFindStatisticsInput = FindStatisticsInput & {
  rankingLimit: number
  dateFromLabel?: string
  dateToLabel?: string
}

export function validateGetAttendanceStatisticsInput(
  input: FindStatisticsInput = {}
): ValidationResult<ValidatedFindStatisticsInput> {
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

  if (input.status !== undefined) {
    if (input.status !== "VALID" && input.status !== "VOIDED") {
      fieldErrors.status = ATTENDANCE_ERROR_MESSAGES.AUDIT_STATUS_INVALID
    }
  }

  let dateFrom: Date | undefined
  let dateTo: Date | undefined

  if (input.dateFrom !== undefined) {
    const parsed = parseStatisticsDate(input.dateFrom)
    if (!parsed) {
      fieldErrors.dateFrom = ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_DATE_INVALID
    } else {
      dateFrom = parsed
    }
  }

  if (input.dateTo !== undefined) {
    const parsed = parseStatisticsDate(input.dateTo)
    if (!parsed) {
      fieldErrors.dateTo = ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_DATE_INVALID
    } else {
      dateTo = parsed
    }
  }

  if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
    fieldErrors.dateFrom = ATTENDANCE_ERROR_MESSAGES.HISTORY_DATE_RANGE_INVALID
  }

  let rankingLimit = DEFAULT_RANKING_LIMIT
  if (input.rankingLimit !== undefined) {
    if (
      typeof input.rankingLimit !== "number" ||
      !Number.isInteger(input.rankingLimit) ||
      input.rankingLimit < 1
    ) {
      fieldErrors.rankingLimit = ATTENDANCE_ERROR_MESSAGES.HISTORY_LIMIT_INVALID
    } else {
      rankingLimit = input.rankingLimit
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  const data: ValidatedFindStatisticsInput = { rankingLimit }
  if (input.studentId !== undefined) {
    data.studentId = (input.studentId as string).trim()
  }
  if (input.status !== undefined) {
    data.status = input.status
  }
  if (dateFrom) {
    data.dateFrom = dateFrom
    data.dateFromLabel = formatStatisticsDate(dateFrom)
  }
  if (dateTo) {
    data.dateTo = dateTo
    data.dateToLabel = formatStatisticsDate(dateTo)
  }

  return { success: true, data }
}
