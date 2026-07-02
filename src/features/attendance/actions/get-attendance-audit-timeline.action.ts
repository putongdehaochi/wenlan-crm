/**
 * @file get-attendance-audit-timeline.action.ts
 * @feature attendance
 * @purpose 签到审计 Timeline；仅调用 Service
 */

"use server"

import { attendanceService } from "@/features/attendance/services/attendance.service"
import type { AttendanceAuditTimeline } from "@/features/attendance/types/attendance-audit-timeline.type"
import type { GetAttendanceAuditTimelineInput } from "@/features/attendance/types/get-attendance-audit-timeline-input.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function getAttendanceAuditTimelineAction(
  input: GetAttendanceAuditTimelineInput
): Promise<AttendanceActionResult<AttendanceAuditTimeline>> {
  return attendanceService.getAttendanceAuditTimeline(input)
}
