/**
 * @file student-group.mapper.ts
 * @feature student-groups
 */

import type { StudentGroupEntity } from "@/features/student-groups/types/student-group-entity.type"
import type { StudentGroupSummary } from "@/features/student-groups/types/student-group-summary.type"

export function toStudentGroupSummary(
  entity: StudentGroupEntity,
  studentIds: string[]
): StudentGroupSummary {
  return {
    id: entity.id,
    name: entity.name,
    type: "SAVED",
    studentIds,
    memberCount: studentIds.length,
    createdAt: entity.createdAt.toISOString(),
  }
}

export function toStudentGroupSummaryList(
  entities: StudentGroupEntity[],
  memberMap: Map<string, string[]>
): StudentGroupSummary[] {
  return entities.map((entity) =>
    toStudentGroupSummary(entity, memberMap.get(entity.id) ?? [])
  )
}
