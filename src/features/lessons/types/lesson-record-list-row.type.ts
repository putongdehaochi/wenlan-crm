/**
 * @file lesson-record-list-row.type.ts
 * @feature lessons
 * @purpose 工作室课时记录列表 ViewModel
 */

import type { LessonRecordRow } from "@/features/lessons/types/lesson-record-row.type"

export type LessonRecordListRow = LessonRecordRow & {
  studentId: string
  studentName: string
}

export type FindLessonRecordsInput = {
  studentId?: string
  recordType?: "purchase" | "adjustment"
  limit?: number
}

export type StudioLessonStatistics = {
  activeStudentCount: number
  totalRecorded: number
  totalConsumed: number
  totalBalance: number
  purchaseCount: number
  adjustmentCount: number
  studentRanks: StudioLessonStudentRank[]
}

export type StudioLessonStudentRank = {
  studentId: string
  studentName: string
  totalRecorded: number
  totalConsumed: number
  balance: number
}
