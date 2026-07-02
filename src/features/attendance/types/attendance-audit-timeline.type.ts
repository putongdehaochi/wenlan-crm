/**
 * @file attendance-audit-timeline.type.ts
 * @feature attendance
 * @purpose Audit Timeline 详情 ViewModel（RC3 冻结）
 */

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"
import type { AttendanceAuditTimelineEvent } from "@/features/attendance/types/attendance-audit-timeline-event.type"

export type AttendanceAuditTimeline = {
  attendanceId: string
  studentId: string
  studentName: string
  attendanceDate: string
  currentStatus: AttendanceStatus
  events: AttendanceAuditTimelineEvent[]
  /** Reserved — Sprint 7 恒 undefined */
  operatorName?: string
  /** Reserved — Sprint 7 恒 undefined */
  reason?: string
  /** Reserved — Sprint 7 恒 undefined */
  source?: string
}
