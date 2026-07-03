/**
 * @file student-group-search.ts
 * @feature student-groups
 */

import type { StudentGroupSummary } from "@/features/student-groups/types/student-group-summary.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import { matchStudents } from "@/shared/components/student-search-select"

const DEFAULT_PREVIEW_COUNT = 3

function resolveGroupMembers(
  group: StudentGroupSummary,
  students: StudentSummary[]
): StudentSummary[] {
  const studentMap = new Map(students.map((student) => [student.id, student]))

  return group.studentIds
    .map((id) => studentMap.get(id))
    .filter((student): student is StudentSummary => student !== undefined)
}

export function formatGroupTeacherLabel(
  group: StudentGroupSummary,
  teachers: TeacherSummary[]
): string {
  if (!group.teacherId) {
    return "系统默认"
  }

  return teachers.find((teacher) => teacher.id === group.teacherId)?.name ?? "—"
}

export function filterStudentGroups(
  groups: StudentGroupSummary[],
  students: StudentSummary[],
  teachers: TeacherSummary[],
  query: string
): StudentGroupSummary[] {
  const normalized = query.trim()
  if (!normalized) {
    return groups
  }

  const tokens = normalized.toLowerCase().split(/\s+/).filter(Boolean)

  return groups.filter((group) => {
    const nameHaystack = group.name.toLowerCase()
    if (tokens.every((token) => nameHaystack.includes(token))) {
      return true
    }

    const teacherName = formatGroupTeacherLabel(group, teachers).toLowerCase()
    if (tokens.every((token) => teacherName.includes(token))) {
      return true
    }

    const members = resolveGroupMembers(group, students)
    return matchStudents(members, normalized).length > 0
  })
}

export function formatGroupMemberPreview(
  group: StudentGroupSummary,
  students: StudentSummary[],
  maxPreview = DEFAULT_PREVIEW_COUNT
): string {
  const members = resolveGroupMembers(group, students)
  const names = members.map((student) => student.name)

  if (names.length === 0) {
    return "暂无成员"
  }

  if (names.length <= maxPreview) {
    return names.join("、")
  }

  return `${names.slice(0, maxPreview).join("、")} 等 ${names.length} 人`
}
