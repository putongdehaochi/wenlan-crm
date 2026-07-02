/**
 * @file attendance.repository.ts
 * @feature attendance
 * @purpose Attendance 数据访问；仅 CRUD / 查询，不计算余额（ADR-009）
 */

import type { Attendance } from "@/generated/prisma/client"
import { toAttendanceDate } from "@/features/attendance/lib/attendance-date"
import { appendLifecycleEvent } from "@/features/attendance/repositories/attendance-lifecycle.repository"
import type {
  AttendanceEntity,
  CreateAttendanceEntityInput,
} from "@/features/attendance/types/attendance-entity.type"
import type { FindAuditInput } from "@/features/attendance/types/find-audit-input.type"
import type { FindHistoryInput } from "@/features/attendance/types/find-history-input.type"
import { prisma } from "@/shared/lib/db"

function buildDateRangeWhere(input: {
  studentId?: string
  dateFrom?: Date | string
  dateTo?: Date | string
}) {
  const where: {
    studentId?: string
    attendanceDate?: { gte?: Date; lte?: Date }
  } = {}

  if (input.studentId) {
    where.studentId = input.studentId
  }

  if (input.dateFrom !== undefined || input.dateTo !== undefined) {
    where.attendanceDate = {}
    if (input.dateFrom !== undefined) {
      where.attendanceDate.gte = toAttendanceDate(input.dateFrom)
    }
    if (input.dateTo !== undefined) {
      where.attendanceDate.lte = toAttendanceDate(input.dateTo)
    }
  }

  return where
}

function buildFindHistoryWhere(input: FindHistoryInput) {
  const where = buildDateRangeWhere(input)
  return Object.keys(where).length > 0 ? where : undefined
}

function buildFindAuditWhere(input: FindAuditInput) {
  const where = buildDateRangeWhere(input) as {
    studentId?: string
    attendanceDate?: { gte?: Date; lte?: Date }
    status?: Attendance["status"]
  }

  if (input.status) {
    where.status = input.status
  }

  return Object.keys(where).length > 0 ? where : undefined
}

function toAttendanceEntity(row: Attendance): AttendanceEntity {
  return {
    id: row.id,
    studentId: row.studentId,
    attendanceDate: row.attendanceDate,
    status: row.status,
    voidedAt: row.voidedAt,
    createdAt: row.createdAt,
  }
}

export async function create(
  input: CreateAttendanceEntityInput
): Promise<AttendanceEntity> {
  return prisma.$transaction(async (tx) => {
    const row = await tx.attendance.create({
      data: {
        studentId: input.studentId,
        attendanceDate: toAttendanceDate(input.attendanceDate),
        status: input.status ?? "VALID",
      },
    })

    await appendLifecycleEvent(
      {
        attendanceId: row.id,
        eventType: "CHECK_IN",
        occurredAt: row.createdAt,
      },
      tx
    )

    return toAttendanceEntity(row)
  })
}

export async function existsToday(
  studentId: string,
  attendanceDate: Date
): Promise<boolean> {
  const row = await prisma.attendance.findFirst({
    where: {
      studentId,
      attendanceDate: toAttendanceDate(attendanceDate),
      status: "VALID",
    },
    select: { id: true },
  })

  return row !== null
}

export async function findTodayByStudent(
  studentId: string,
  attendanceDate: Date
): Promise<AttendanceEntity | null> {
  const row = await prisma.attendance.findFirst({
    where: {
      studentId,
      attendanceDate: toAttendanceDate(attendanceDate),
    },
  })

  return row ? toAttendanceEntity(row) : null
}

/** 批量返回当日已撤销签到的 studentId → attendanceId */
export async function getTodayVoidedMap(
  studentIds: string[],
  attendanceDate: Date
): Promise<Map<string, string>> {
  if (studentIds.length === 0) {
    return new Map()
  }

  const rows = await prisma.attendance.findMany({
    where: {
      studentId: { in: studentIds },
      attendanceDate: toAttendanceDate(attendanceDate),
      status: "VOIDED",
    },
    select: { id: true, studentId: true },
  })

  return new Map(rows.map((row) => [row.studentId, row.id]))
}

import type { TodayAttendanceDetail } from "@/features/attendance/types/attendance-today-row.type"
export async function getTodayDetailsMap(
  studentIds: string[],
  attendanceDate: Date
): Promise<Map<string, TodayAttendanceDetail>> {
  if (studentIds.length === 0) {
    return new Map()
  }

  const rows = await prisma.attendance.findMany({
    where: {
      studentId: { in: studentIds },
      attendanceDate: toAttendanceDate(attendanceDate),
    },
    select: {
      id: true,
      studentId: true,
      status: true,
      createdAt: true,
      voidedAt: true,
    },
  })

  return new Map(
    rows.map((row) => [
      row.studentId,
      {
        attendanceId: row.id,
        status: row.status,
        checkedInAt: row.createdAt,
        voidedAt: row.voidedAt,
      },
    ])
  )
}

/** 批量返回指定日期已有效签到的 studentId 集合（禁止 N+1） */
export async function getTodayStatuses(
  studentIds: string[],
  attendanceDate: Date
): Promise<Set<string>> {
  if (studentIds.length === 0) {
    return new Set()
  }

  const rows = await prisma.attendance.findMany({
    where: {
      studentId: { in: studentIds },
      attendanceDate: toAttendanceDate(attendanceDate),
      status: "VALID",
    },
    select: { studentId: true },
  })

  return new Set(rows.map((row) => row.studentId))
}

export async function findById(id: string): Promise<AttendanceEntity | null> {
  const row = await prisma.attendance.findUnique({
    where: { id },
  })

  return row ? toAttendanceEntity(row) : null
}

export async function findHistory(
  input: FindHistoryInput
): Promise<AttendanceEntity[]> {
  const rows = await prisma.attendance.findMany({
    where: buildFindHistoryWhere(input),
    orderBy: [{ attendanceDate: "desc" }, { createdAt: "desc" }],
    take: input.limit,
  })

  return rows.map(toAttendanceEntity)
}

export async function findAuditList(
  input: FindAuditInput
): Promise<AttendanceEntity[]> {
  const rows = await prisma.attendance.findMany({
    where: buildFindAuditWhere(input),
    orderBy: [{ attendanceDate: "desc" }, { createdAt: "desc" }],
    take: input.limit,
  })

  return rows.map(toAttendanceEntity)
}

/** `void` 为保留字；对外契约名仍为 `void()` */
export async function voidRecord(id: string): Promise<AttendanceEntity> {
  return prisma.$transaction(async (tx) => {
    const voidedAt = new Date()
    const row = await tx.attendance.update({
      where: { id },
      data: { status: "VOIDED", voidedAt },
    })

    await appendLifecycleEvent(
      {
        attendanceId: row.id,
        eventType: "VOID",
        occurredAt: voidedAt,
      },
      tx
    )

    return toAttendanceEntity(row)
  })
}

/** 对外契约名 `restore()` */
export async function restoreRecord(id: string): Promise<AttendanceEntity> {
  return prisma.$transaction(async (tx) => {
    const restoredAt = new Date()
    const row = await tx.attendance.update({
      where: { id },
      data: { status: "VALID", voidedAt: null },
    })

    await appendLifecycleEvent(
      {
        attendanceId: row.id,
        eventType: "RESTORE",
        occurredAt: restoredAt,
      },
      tx
    )

    return toAttendanceEntity(row)
  })
}

export const attendanceRepository = {
  create,
  existsToday,
  findTodayByStudent,
  getTodayVoidedMap,
  getTodayStatuses,
  getTodayDetailsMap,
  findById,
  findHistory,
  findAuditList,
  void: voidRecord,
  restore: restoreRecord,
}
