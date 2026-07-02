/**
 * @file attendance-statistics.repository.ts
 * @feature attendance
 * @purpose Attendance 统计聚合；仅 COUNT / GROUP BY，无 Student Mapping / Balance
 */

import type { Prisma } from "@/generated/prisma/client"
import { toAttendanceDate } from "@/features/attendance/lib/attendance-date"
import type { LifecycleEventType } from "@/features/attendance/types/attendance-lifecycle-event-entity.type"
import type { FindStatisticsInput } from "@/features/attendance/types/find-statistics-input.type"
import type { MonthlyAttendanceAggregateRow } from "@/features/attendance/types/monthly-attendance-aggregate-row.type"
import type { StudentAggregateRow } from "@/features/attendance/types/student-aggregate-row.type"
import { prisma } from "@/shared/lib/db"

function buildAttendanceStatisticsWhere(
  filter: FindStatisticsInput
): Prisma.AttendanceWhereInput {
  const where: Prisma.AttendanceWhereInput = {}

  if (filter.studentId) {
    where.studentId = filter.studentId
  }

  if (filter.dateFrom !== undefined || filter.dateTo !== undefined) {
    where.attendanceDate = {}
    if (filter.dateFrom !== undefined) {
      where.attendanceDate.gte = toAttendanceDate(filter.dateFrom)
    }
    if (filter.dateTo !== undefined) {
      where.attendanceDate.lte = toAttendanceDate(filter.dateTo)
    }
  }

  if (filter.status) {
    where.status = filter.status
  }

  return where
}

function attendanceStatusForAggregation(
  filter: FindStatisticsInput
): FindStatisticsInput["status"] {
  return filter.status ?? "VALID"
}
function formatAttendanceMonth(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function buildLifecycleStatisticsWhere(
  filter: FindStatisticsInput
): Prisma.AttendanceLifecycleEventWhereInput {
  const where: Prisma.AttendanceLifecycleEventWhereInput = {}

  if (filter.studentId) {
    where.studentId = filter.studentId
  }

  if (filter.dateFrom !== undefined || filter.dateTo !== undefined) {
    where.occurredAt = {}
    if (filter.dateFrom !== undefined) {
      where.occurredAt.gte = toAttendanceDate(filter.dateFrom)
    }
    if (filter.dateTo !== undefined) {
      const end = toAttendanceDate(filter.dateTo)
      end.setHours(23, 59, 59, 999)
      where.occurredAt.lte = end
    }
  }

  return where
}

export async function countTotalAttendance(
  filter: FindStatisticsInput
): Promise<number> {
  return prisma.attendance.count({
    where: buildAttendanceStatisticsWhere(filter),
  })
}

export async function countValidAttendance(
  filter: FindStatisticsInput
): Promise<number> {
  if (filter.status === "VOIDED") {
    return 0
  }

  return prisma.attendance.count({
    where: {
      ...buildAttendanceStatisticsWhere(filter),
      status: "VALID",
    },
  })
}

export async function countVoidedAttendance(
  filter: FindStatisticsInput
): Promise<number> {
  if (filter.status === "VALID") {
    return 0
  }

  return prisma.attendance.count({
    where: {
      ...buildAttendanceStatisticsWhere(filter),
      status: "VOIDED",
    },
  })
}
export async function countLifecycleEvents(
  filter: FindStatisticsInput,
  eventType: LifecycleEventType
): Promise<number> {
  return prisma.attendanceLifecycleEvent.count({
    where: {
      ...buildLifecycleStatisticsWhere(filter),
      eventType,
    },
  })
}

export async function groupValidAttendanceByStudent(
  filter: FindStatisticsInput,
  limit: number
): Promise<StudentAggregateRow[]> {
  const groups = await prisma.attendance.groupBy({
    by: ["studentId"],
    where: {
      ...buildAttendanceStatisticsWhere(filter),
      status: attendanceStatusForAggregation(filter),
    },
    _count: { _all: true },
  })

  return groups
    .map((group) => ({
      studentId: group.studentId,
      validAttendance: group._count._all,
    }))
    .sort((left, right) => right.validAttendance - left.validAttendance)
    .slice(0, limit)
}

export async function groupAllValidAttendanceByStudent(
  filter: FindStatisticsInput
): Promise<StudentAggregateRow[]> {
  const groups = await prisma.attendance.groupBy({
    by: ["studentId"],
    where: {
      ...buildAttendanceStatisticsWhere(filter),
      status: "VALID",
    },
    _count: { _all: true },
  })

  return groups.map((group) => ({
    studentId: group.studentId,
    validAttendance: group._count._all,
  }))
}

export async function groupValidAttendanceByMonth(
  filter: FindStatisticsInput
): Promise<MonthlyAttendanceAggregateRow[]> {
  const dailyGroups = await prisma.attendance.groupBy({
    by: ["attendanceDate"],
    where: {
      ...buildAttendanceStatisticsWhere(filter),
      status: attendanceStatusForAggregation(filter),
    },
    _count: { _all: true },
  })
  const monthCounts = new Map<string, number>()
  for (const group of dailyGroups) {
    const month = formatAttendanceMonth(group.attendanceDate)
    monthCounts.set(
      month,
      (monthCounts.get(month) ?? 0) + group._count._all
    )
  }

  return Array.from(monthCounts.entries()).map(([month, validAttendanceCount]) => ({
    month,
    validAttendanceCount,
  }))
}

export const attendanceStatisticsRepository = {
  countTotalAttendance,
  countValidAttendance,
  countVoidedAttendance,
  countLifecycleEvents,
  groupValidAttendanceByStudent,
  groupAllValidAttendanceByStudent,
  groupValidAttendanceByMonth,
}
