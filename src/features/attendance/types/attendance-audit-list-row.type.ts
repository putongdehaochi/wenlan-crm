/**
 * @file attendance-audit-list-row.type.ts
 * @feature attendance
 * @purpose 签到审计列表 ViewModel（Sprint 7 冻结）
 */

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"
import type { LifecycleEventType } from "@/features/attendance/types/attendance-lifecycle-event-entity.type"

export type AttendanceAuditListRow = {
  id: string
  studentId: string
  studentName: string
  attendanceDate: string
  status: AttendanceStatus
  checkedInAt: string
  voidedAt: string | null
  lastEventType: LifecycleEventType | null
  lastEventAt: string | null
  eventCount: number
  /** Reserved — Sprint 7 不展示 */
  teacherName?: string
  /** Reserved — Sprint 7 不展示 */
  className?: string
}
