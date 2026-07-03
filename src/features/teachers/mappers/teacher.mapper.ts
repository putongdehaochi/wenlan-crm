/**
 * @file teacher.mapper.ts
 * @feature teachers
 */

import type { TeacherEntity } from "@/features/teachers/types/teacher-entity.type"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"

export function toTeacherSummary(entity: TeacherEntity): TeacherSummary {
  return {
    id: entity.id,
    name: entity.name,
    isDefault: entity.isDefault,
    createdAt: entity.createdAt.toISOString(),
  }
}

export function toTeacherSummaryList(
  entities: TeacherEntity[]
): TeacherSummary[] {
  return entities.map(toTeacherSummary)
}

export function toTeacherNameMap(
  entities: TeacherEntity[]
): Map<string, string> {
  return new Map(entities.map((entity) => [entity.id, entity.name]))
}
