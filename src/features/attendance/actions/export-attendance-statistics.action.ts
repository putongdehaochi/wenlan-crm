/**
 * @file export-attendance-statistics.action.ts
 * @feature attendance
 * @purpose Statistics CSV 导出；仅调用 Export Service
 */

"use server"

import { attendanceExportService } from "@/features/attendance/services/attendance-export.service"
import type { AttendanceExportPayload } from "@/features/attendance/types/attendance-export-payload.type"
import type { ExportAttendanceStatisticsInput } from "@/features/attendance/types/export-attendance-statistics-input.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function exportAttendanceStatisticsAction(
  input: ExportAttendanceStatisticsInput = {}
): Promise<AttendanceActionResult<AttendanceExportPayload>> {
  return attendanceExportService.exportAttendanceStatistics(input)
}
