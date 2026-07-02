/**
 * @file student-search.ts
 * @feature students
 * @purpose 学员列表模糊搜索
 */

import type { StudentSummary } from "@/features/students/types/student-summary.type"

export function normalizeStudentSearchText(value: string): string {
  return value.trim().toLowerCase()
}

export function matchStudentSummaries(
  students: StudentSummary[],
  query: string
): StudentSummary[] {
  const normalized = normalizeStudentSearchText(query)
  if (!normalized) {
    return students
  }

  const tokens = normalized.split(/\s+/).filter(Boolean)

  return students.filter((student) => {
    const haystack = [student.name, student.contactName, student.phone ?? ""]
      .join(" ")
      .toLowerCase()

    return tokens.every((token) => haystack.includes(token))
  })
}

export type StudentSortKey =
  | "name-asc"
  | "name-desc"
  | "balance-desc"
  | "balance-asc"

export function sortStudentSummaries(
  students: StudentSummary[],
  sortKey: StudentSortKey
): StudentSummary[] {
  const sorted = [...students]

  switch (sortKey) {
    case "name-desc":
      return sorted.sort((left, right) => right.name.localeCompare(left.name, "zh-CN"))
    case "balance-desc":
      return sorted.sort((left, right) => right.lessonBalance - left.lessonBalance)
    case "balance-asc":
      return sorted.sort((left, right) => left.lessonBalance - right.lessonBalance)
    case "name-asc":
    default:
      return sorted.sort((left, right) => left.name.localeCompare(right.name, "zh-CN"))
  }
}
