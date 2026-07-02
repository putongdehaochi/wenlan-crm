/**
 * @file export-attendance-audit.action.ts
 * @feature attendance
 * @purpose Audit List CSV 导出；仅调用 Export Service
 */

"use server"

import { attendanceExportService } from "@/features/attendance/services/attendance-export.service"
import type { AttendanceExportPayload } from "@/features/attendance/types/attendance-export-payload.type"
import type { ExportAttendanceAuditInput } from "@/features/attendance/types/export-attendance-audit-input.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function exportAttendanceAuditAction(
  input: ExportAttendanceAuditInput = {}
): Promise<AttendanceActionResult<AttendanceExportPayload>> {
  return attendanceExportService.exportAttendanceAudit(input)
}
