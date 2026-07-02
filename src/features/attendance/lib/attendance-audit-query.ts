/**
 * @file attendance-audit-query.ts
 * @feature attendance
 * @purpose 签到审计页 URL Query 构建
 */

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"

export type AttendanceAuditQuery = {
  studentId?: string
  dateFrom?: string
  dateTo?: string
  status?: AttendanceStatus
}

export function buildAttendanceAuditHref(
  params: AttendanceAuditQuery = {}
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
  return query ? `/attendance/audit?${query}` : "/attendance/audit"
}

export function buildListAttendanceAuditInput(
  params: AttendanceAuditQuery = {}
) {
  return {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.dateFrom ? { dateFrom: params.dateFrom } : {}),
    ...(params.dateTo ? { dateTo: params.dateTo } : {}),
    ...(params.status ? { status: params.status } : {}),
  }
}

export function parseAuditStatusFilter(
  value: string | undefined
): AttendanceStatus | undefined {
  if (value === "VALID" || value === "VOIDED") {
    return value
  }
  return undefined
}
