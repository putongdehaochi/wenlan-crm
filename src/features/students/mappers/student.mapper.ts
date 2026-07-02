/**
 * @file student.mapper.ts
 * @feature students
 * @purpose Entity → ViewModel 映射；装配 lessonBalance
 */

import type { StudentDetail } from "@/features/students/types/student-detail.type"
import type { StudentEntity } from "@/features/students/types/student-entity.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"

export function toSummary(
  entity: StudentEntity,
  lessonBalance: number
): StudentSummary {
  return {
    id: entity.id,
    name: entity.name,
    contactName: entity.contactName,
    phone: entity.phone,
    status: entity.status,
    lessonBalance,
  }
}

export function toDetail(
  entity: StudentEntity,
  lessonBalance: number
): StudentDetail {
  return {
    id: entity.id,
    name: entity.name,
    contactName: entity.contactName,
    phone: entity.phone,
    note: entity.note,
    status: entity.status,
    lessonBalance,
    createdAt: entity.createdAt,
  }
}

export function toSummaryList(
  entities: StudentEntity[],
  lessonBalanceMap: Map<string, number>
): StudentSummary[] {
  return entities.map((entity) =>
    toSummary(entity, lessonBalanceMap.get(entity.id) ?? 0)
  )
}
