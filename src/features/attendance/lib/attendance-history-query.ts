/**
 * @file attendance-history-query.ts
 * @feature attendance
 * @purpose 签到历史页 URL Query 构建（studentId / dateFrom / dateTo）
 */

export type AttendanceHistoryQuery = {
  studentId?: string
  dateFrom?: string
  dateTo?: string
}

export function buildAttendanceHistoryHref(
  params: AttendanceHistoryQuery = {}
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

  const query = search.toString()
  return query ? `/attendance/history?${query}` : "/attendance/history"
}

export function buildListAttendanceHistoryInput(
  params: AttendanceHistoryQuery = {}
) {
  return {
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.dateFrom ? { dateFrom: params.dateFrom } : {}),
    ...(params.dateTo ? { dateTo: params.dateTo } : {}),
  }
}
