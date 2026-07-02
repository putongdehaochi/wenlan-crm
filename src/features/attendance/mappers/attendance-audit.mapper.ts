/**
 * @file attendance-audit.mapper.ts
 * @feature attendance
 * @purpose Audit Entity → ViewModel；Timeline 排序 · Label · lastEvent 派生
 *
 * 禁止：Repository 调用 · Service 调用
 */

import type { AttendanceAuditListRow } from "@/features/attendance/types/attendance-audit-list-row.type"
import type { AttendanceAuditTimelineEvent } from "@/features/attendance/types/attendance-audit-timeline-event.type"
import type { AttendanceAuditTimeline } from "@/features/attendance/types/attendance-audit-timeline.type"
import type { AttendanceEntity } from "@/features/attendance/types/attendance-entity.type"
import type {
  AttendanceLifecycleEventEntity,
  LifecycleEventType,
} from "@/features/attendance/types/attendance-lifecycle-event-entity.type"
import type { StudentEntity } from "@/features/students/types/student-entity.type"

function formatAttendanceDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function sortLifecycleEventsAscending(
  events: AttendanceLifecycleEventEntity[]
): AttendanceLifecycleEventEntity[] {
  return [...events].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
  )
}

export function lifecycleEventLabel(eventType: LifecycleEventType): string {
  switch (eventType) {
    case "CHECK_IN":
      return "签到"
    case "VOID":
      return "撤销"
    case "RESTORE":
      return "恢复"
  }
}

function toTimelineEvent(
  event: AttendanceLifecycleEventEntity
): AttendanceAuditTimelineEvent {
  return {
    eventType: event.eventType,
    occurredAt: event.occurredAt.toISOString(),
    label: lifecycleEventLabel(event.eventType),
    operatorName: null,
    reason: null,
    source: null,
  }
}

function deriveLastEvent(events: AttendanceLifecycleEventEntity[]): {
  lastEventType: LifecycleEventType | null
  lastEventAt: string | null
  eventCount: number
} {
  if (events.length === 0) {
    return { lastEventType: null, lastEventAt: null, eventCount: 0 }
  }

  const sorted = sortLifecycleEventsAscending(events)
  const last = sorted[sorted.length - 1]!

  return {
    lastEventType: last.eventType,
    lastEventAt: last.occurredAt.toISOString(),
    eventCount: events.length,
  }
}

export function toAttendanceAuditListRow(
  entity: AttendanceEntity,
  student: StudentEntity | undefined,
  events: AttendanceLifecycleEventEntity[]
): AttendanceAuditListRow {
  const lastEvent = deriveLastEvent(events)

  return {
    id: entity.id,
    studentId: entity.studentId,
    studentName: student?.name ?? "未知学员",
    attendanceDate: formatAttendanceDate(entity.attendanceDate),
    status: entity.status,
    checkedInAt: entity.createdAt.toISOString(),
    voidedAt: entity.voidedAt ? entity.voidedAt.toISOString() : null,
    lastEventType: lastEvent.lastEventType,
    lastEventAt: lastEvent.lastEventAt,
    eventCount: lastEvent.eventCount,
  }
}

export function toAttendanceAuditListRowList(
  entities: AttendanceEntity[],
  studentMap: Map<string, StudentEntity>,
  eventsByAttendanceId: Map<string, AttendanceLifecycleEventEntity[]>
): AttendanceAuditListRow[] {
  return entities.map((entity) =>
    toAttendanceAuditListRow(
      entity,
      studentMap.get(entity.studentId),
      eventsByAttendanceId.get(entity.id) ?? []
    )
  )
}

export function toAttendanceAuditTimeline(
  entity: AttendanceEntity,
  student: StudentEntity | undefined,
  events: AttendanceLifecycleEventEntity[]
): AttendanceAuditTimeline {
  const sorted = sortLifecycleEventsAscending(events)

  return {
    attendanceId: entity.id,
    studentId: entity.studentId,
    studentName: student?.name ?? "未知学员",
    attendanceDate: formatAttendanceDate(entity.attendanceDate),
    currentStatus: entity.status,
    events: sorted.map(toTimelineEvent),
  }
}

export function groupLifecycleEventsByAttendanceId(
  events: AttendanceLifecycleEventEntity[]
): Map<string, AttendanceLifecycleEventEntity[]> {
  const map = new Map<string, AttendanceLifecycleEventEntity[]>()

  for (const event of events) {
    const existing = map.get(event.attendanceId) ?? []
    existing.push(event)
    map.set(event.attendanceId, existing)
  }

  return map
}
