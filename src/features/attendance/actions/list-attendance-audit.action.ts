/**
 * @file list-attendance-audit.action.ts
 * @feature attendance
 * @purpose 签到审计列表；仅调用 Service
 */

"use server"

import { attendanceService } from "@/features/attendance/services/attendance.service"
import type { AttendanceAuditListRow } from "@/features/attendance/types/attendance-audit-list-row.type"
import type { FindAuditInput } from "@/features/attendance/types/find-audit-input.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function listAttendanceAuditAction(
  input: FindAuditInput = {}
): Promise<AttendanceActionResult<AttendanceAuditListRow[]>> {
  return attendanceService.listAttendanceAudit(input)
}
