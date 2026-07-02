/**
 * @file attendance-lifecycle.repository.ts
 * @feature attendance
 * @purpose Lifecycle Event 数据访问；append + find，无 Timeline 排序 / Label 转换
 */

import type { AttendanceLifecycleEvent } from "@/generated/prisma/client"
import type { Prisma } from "@/generated/prisma/client"
import type { AppendLifecycleEventInput } from "@/features/attendance/types/append-lifecycle-event-input.type"
import type { AttendanceLifecycleEventEntity } from "@/features/attendance/types/attendance-lifecycle-event-entity.type"
import { prisma } from "@/shared/lib/db"

type TransactionClient = Prisma.TransactionClient

function toLifecycleEventEntity(
  row: AttendanceLifecycleEvent
): AttendanceLifecycleEventEntity {
  return {
    id: row.id,
    attendanceId: row.attendanceId,
    studentId: row.studentId,
    eventType: row.eventType,
    occurredAt: row.occurredAt,
    operatorId: row.operatorId,
    metadata: row.metadata,
    createdAt: row.createdAt,
  }
}

export async function appendLifecycleEvent(
  input: AppendLifecycleEventInput,
  tx?: TransactionClient
): Promise<AttendanceLifecycleEventEntity> {
  const client = tx ?? prisma

  const attendance = await client.attendance.findUniqueOrThrow({
    where: { id: input.attendanceId },
    select: { studentId: true },
  })

  const row = await client.attendanceLifecycleEvent.create({
    data: {
      attendanceId: input.attendanceId,
      studentId: attendance.studentId,
      eventType: input.eventType,
      occurredAt: input.occurredAt,
      operatorId: input.operatorId ?? null,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  })

  return toLifecycleEventEntity(row)
}

export async function findByAttendanceId(
  attendanceId: string
): Promise<AttendanceLifecycleEventEntity[]> {
  const rows = await prisma.attendanceLifecycleEvent.findMany({
    where: { attendanceId },
  })

  return rows.map(toLifecycleEventEntity)
}

export async function findByAttendanceIds(
  attendanceIds: string[]
): Promise<AttendanceLifecycleEventEntity[]> {
  if (attendanceIds.length === 0) {
    return []
  }

  const rows = await prisma.attendanceLifecycleEvent.findMany({
    where: { attendanceId: { in: attendanceIds } },
  })

  return rows.map(toLifecycleEventEntity)
}

export const attendanceLifecycleRepository = {
  appendLifecycleEvent,
  findByAttendanceId,
  findByAttendanceIds,
}
