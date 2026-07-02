/**
 * @file append-lifecycle-event-input.type.ts
 * @feature attendance
 * @purpose appendLifecycleEvent 入参（RC1 冻结）
 */

import type { LifecycleEventType } from "@/features/attendance/types/attendance-lifecycle-event-entity.type"

export type AppendLifecycleEventInput = {
  attendanceId: string
  eventType: LifecycleEventType
  occurredAt: Date
  /** Reserved — Sprint 7 不传 */
  operatorId?: string | null
  /** Reserved JSON — Sprint 7 不传 */
  metadata?: Record<string, unknown> | null
}
