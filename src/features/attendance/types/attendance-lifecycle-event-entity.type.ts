/**
 * @file attendance-lifecycle-event-entity.type.ts
 * @feature attendance
 * @purpose Lifecycle Event 持久化 Entity；Repository 层专用
 */

export type LifecycleEventType = "CHECK_IN" | "VOID" | "RESTORE"

export type AttendanceLifecycleEventEntity = {
  id: string
  attendanceId: string
  studentId: string
  eventType: LifecycleEventType
  occurredAt: Date
  operatorId: string | null
  metadata: unknown | null
  createdAt: Date
}
