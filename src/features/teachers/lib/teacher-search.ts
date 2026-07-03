/**
 * @file teacher-search.ts
 * @feature teachers
 */

import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"

export function filterTeachersBySearch(
  teachers: TeacherSummary[],
  query: string
): TeacherSummary[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return teachers
  }

  return teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(normalized)
  )
}
