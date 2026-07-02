/**
 * @file lesson.mapper.ts
 * @feature lessons
 * @purpose Entity → ViewModel 映射
 */

import type { LessonPackageEntity } from "@/features/lessons/types/lesson-package-entity.type"
import type { LessonPurchaseResult } from "@/features/lessons/types/lesson-purchase-result.type"
import type { LessonRecordListRow } from "@/features/lessons/types/lesson-record-list-row.type"
import type { LessonRecordRow } from "@/features/lessons/types/lesson-record-row.type"
import type { StudentLessonRecords } from "@/features/lessons/types/lesson-record-row.type"
import type { StudioLessonStatistics } from "@/features/lessons/types/lesson-record-list-row.type"
import {
  formatAdjustmentNote,
  isAdjustmentRecord,
} from "@/features/lessons/validators/adjust-lesson-balance.validator"
import type { StudentEntity } from "@/features/students/types/student-entity.type"

export function toLessonRecordRow(entity: LessonPackageEntity): LessonRecordRow {
  const adjustment = isAdjustmentRecord(entity.note)
  return {
    id: entity.id,
    quantity: entity.quantity,
    note: adjustment ? formatAdjustmentNote(entity.note) : entity.note,
    purchasedAt: entity.purchasedAt.toISOString(),
    recordType: adjustment ? "adjustment" : "purchase",
  }
}

export function toLessonRecordListRow(
  entity: LessonPackageEntity,
  student: StudentEntity | undefined
): LessonRecordListRow {
  return {
    ...toLessonRecordRow(entity),
    studentId: entity.studentId,
    studentName: student?.name ?? "未知学员",
  }
}

export function toLessonRecordListRows(
  entities: LessonPackageEntity[],
  studentMap: Map<string, StudentEntity>
): LessonRecordListRow[] {
  return entities.map((entity) =>
    toLessonRecordListRow(entity, studentMap.get(entity.studentId))
  )
}

export function toStudioLessonStatistics(input: {
  activeStudentCount: number
  summary: {
    totalRecorded: number
    totalConsumed: number
    totalBalance: number
  }
  purchaseCount: number
  adjustmentCount: number
  students: StudentEntity[]
  balanceMap: Map<string, number>
  recordedMap: Map<string, number>
  consumedMap: Map<string, number>
}): StudioLessonStatistics {
  const studentRanks = input.students
    .map((student) => ({
      studentId: student.id,
      studentName: student.name,
      totalRecorded: input.recordedMap.get(student.id) ?? 0,
      totalConsumed: input.consumedMap.get(student.id) ?? 0,
      balance: input.balanceMap.get(student.id) ?? 0,
    }))
    .sort((left, right) => right.balance - left.balance)

  return {
    activeStudentCount: input.activeStudentCount,
    totalRecorded: input.summary.totalRecorded,
    totalConsumed: input.summary.totalConsumed,
    totalBalance: input.summary.totalBalance,
    purchaseCount: input.purchaseCount,
    adjustmentCount: input.adjustmentCount,
    studentRanks,
  }
}

export function toStudentLessonRecords(
  entities: LessonPackageEntity[],
  summary: StudentLessonRecords["summary"]
): StudentLessonRecords {
  return {
    summary,
    records: entities.map(toLessonRecordRow),
  }
}

export function toLessonPurchaseResult(
  entity: LessonPackageEntity,
  lessonBalance: number
): LessonPurchaseResult {
  return {
    id: entity.id,
    studentId: entity.studentId,
    quantity: entity.quantity,
    lessonBalance,
    purchasedAt: entity.purchasedAt,
  }
}
