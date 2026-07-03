/**
 * @file attendance-today-search.ts
 * @feature attendance
 */

import type { AttendanceTodayRow } from "@/features/attendance/types/attendance-today-row.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { matchStudents } from "@/shared/components/student-search-select"

export function filterTodayRowsBySearch(
  rows: AttendanceTodayRow[],
  students: StudentSummary[],
  query: string
): AttendanceTodayRow[] {
  const normalized = query.trim()
  if (!normalized) {
    return rows
  }

  const matchedIds = new Set(
    matchStudents(students, normalized).map((student) => student.id)
  )

  return rows.filter((row) => matchedIds.has(row.id))
}

/** SESSION 分组 studentIds 为空时表示「全部在读学员」 */
export function isSessionShowAll(studentIds: string[]): boolean {
  return studentIds.length === 0
}

export function describeSessionGroup(studentIds: string[], totalActive: number): string {
  if (isSessionShowAll(studentIds)) {
    return `全部在读学员（${totalActive} 人）`
  }
  return `已选 ${studentIds.length} 人`
}
