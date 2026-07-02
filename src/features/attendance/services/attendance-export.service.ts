/**
 * @file attendance-export.service.ts
 * @feature attendance
 * @purpose Export 编排；复用 Audit / Statistics 唯一事实源（Sprint 8 RC6）
 */

import {
  toAuditCsvPayload,
  toStatisticsCsvPayload,
} from "@/features/attendance/serializers/attendance-export.serializer"
import { attendanceService } from "@/features/attendance/services/attendance.service"
import { attendanceStatisticsService } from "@/features/attendance/services/attendance-statistics.service"
import type { AttendanceExportPayload } from "@/features/attendance/types/attendance-export-payload.type"
import type { ExportAttendanceAuditInput } from "@/features/attendance/types/export-attendance-audit-input.type"
import type { ExportAttendanceStatisticsInput } from "@/features/attendance/types/export-attendance-statistics-input.type"
import { validateExportAttendanceAuditInput } from "@/features/attendance/validators/export-attendance-audit.validator"
import { validateExportAttendanceStatisticsInput } from "@/features/attendance/validators/export-attendance-statistics.validator"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function exportAttendanceAudit(
  input: ExportAttendanceAuditInput = {}
): Promise<AttendanceActionResult<AttendanceExportPayload>> {
  const validation = validateExportAttendanceAuditInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  const listResult = await attendanceService.listAttendanceAudit(validation.data)
  if (!listResult.success) {
    return listResult
  }

  return {
    success: true,
    data: toAuditCsvPayload(listResult.data, new Date()),
  }
}

export async function exportAttendanceStatistics(
  input: ExportAttendanceStatisticsInput = {}
): Promise<AttendanceActionResult<AttendanceExportPayload>> {
  const validation = validateExportAttendanceStatisticsInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  const statisticsResult = await attendanceStatisticsService.getAttendanceStatistics(
    validation.data
  )
  if (!statisticsResult.success) {
    return statisticsResult
  }

  return {
    success: true,
    data: toStatisticsCsvPayload(statisticsResult.data, new Date()),
  }
}

export const attendanceExportService = {
  exportAttendanceAudit,
  exportAttendanceStatistics,
}
