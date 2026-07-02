/**
 * @file export-attendance-audit.validator.ts
 * @feature attendance
 * @purpose Audit Export 入参校验；默认 limit 5000
 */

import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import type { ExportAttendanceAuditInput } from "@/features/attendance/types/export-attendance-audit-input.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/attendance/validators/validation-result.type"
import { validateListAttendanceAuditInput } from "@/features/attendance/validators/list-attendance-audit.validator"

const DEFAULT_EXPORT_LIMIT = 5000
const MAX_EXPORT_LIMIT = 5000

export function validateExportAttendanceAuditInput(
  input: ExportAttendanceAuditInput = {}
): ValidationResult<ExportAttendanceAuditInput> {
  const fieldErrors = mergeFieldErrors()

  if (input.teacherId !== undefined) {
    fieldErrors.teacherId = ATTENDANCE_ERROR_MESSAGES.AUDIT_FILTER_RESERVED
  }
  if (input.classId !== undefined) {
    fieldErrors.classId = ATTENDANCE_ERROR_MESSAGES.AUDIT_FILTER_RESERVED
  }
  if (input.cursor !== undefined) {
    fieldErrors.cursor = ATTENDANCE_ERROR_MESSAGES.AUDIT_FILTER_RESERVED
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  const limit = input.limit ?? DEFAULT_EXPORT_LIMIT
  if (limit > MAX_EXPORT_LIMIT) {
    return {
      success: false,
      fieldErrors: {
        limit: ATTENDANCE_ERROR_MESSAGES.HISTORY_LIMIT_INVALID,
      },
    }
  }

  return validateListAttendanceAuditInput({ ...input, limit })
}
