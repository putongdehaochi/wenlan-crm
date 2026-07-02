/**
 * @file export-attendance-statistics.validator.ts
 * @feature attendance
 * @purpose Statistics Export 入参校验；委托 statistics validator
 */

import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import type { ExportAttendanceStatisticsInput } from "@/features/attendance/types/export-attendance-statistics-input.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/attendance/validators/validation-result.type"
import {
  validateGetAttendanceStatisticsInput,
  type ValidatedFindStatisticsInput,
} from "@/features/attendance/validators/get-attendance-statistics.validator"

export function validateExportAttendanceStatisticsInput(
  input: ExportAttendanceStatisticsInput = {}
): ValidationResult<ValidatedFindStatisticsInput> {
  const fieldErrors = mergeFieldErrors()

  if (input.teacherId !== undefined) {
    fieldErrors.teacherId = ATTENDANCE_ERROR_MESSAGES.STATISTICS_FILTER_RESERVED
  }
  if (input.classId !== undefined) {
    fieldErrors.classId = ATTENDANCE_ERROR_MESSAGES.STATISTICS_FILTER_RESERVED
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  return validateGetAttendanceStatisticsInput(input)
}
