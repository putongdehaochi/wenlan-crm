/**
 * @file attendance-statistics-query.ts
 * @feature attendance
 * @purpose 签到统计页 URL Query 构建
 */

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"

export type AttendanceStatisticsQuery = {
  studentId?: string
  dateFrom?: string
  dateTo?: string
  status?: AttendanceStatus
}

export function buildAttendanceStatisticsHref(
  params: AttendanceStatisticsQuery = {}
): string {
  const search = new URLSearchParams()

  if (params.studentId) {
    search.set("studentId", params.studentId)
  }
  if (params.dateFrom) {
    search.set("dateFrom", params.dateFrom)
  }
  if (params.dateTo) {
    search.set("dateTo", params.dateTo)
  }
  if (params.status) {
    search.set("status", params.status)
  }

  const query = search.toString()
  return query ? `/attendance/statistics?${query}` : "/attendance/statistics"
}

export function buildGetAttendanceStatisticsInput(
  params: AttendanceStatisticsQuery = {}
) {
  return {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.dateFrom ? { dateFrom: params.dateFrom } : {}),
    ...(params.dateTo ? { dateTo: params.dateTo } : {}),
    ...(params.status ? { status: params.status } : {}),
  }
}

export function parseStatisticsStatusFilter(
  value: string | undefined
): AttendanceStatus | undefined {
  if (value === "VALID" || value === "VOIDED") {
    return value
  }
  return undefined
}
