/**
 * @file attendance-audit-timeline-event.type.ts
 * @feature attendance
 * @purpose Audit Timeline 单条事件 ViewModel（RC3 冻结）
 */

import type { LifecycleEventType } from "@/features/attendance/types/attendance-lifecycle-event-entity.type"

export type AttendanceAuditTimelineEvent = {
  eventType: LifecycleEventType
  occurredAt: string
  label: string
  /** Reserved — Sprint 7 恒 null */
  operatorName?: string | null
  /** Reserved — Sprint 7 恒 null */
  reason?: string | null
  /** Reserved — Sprint 7 恒 null */
  source?: string | null
}
