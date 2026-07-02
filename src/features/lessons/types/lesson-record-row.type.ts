/**
 * @file lesson-record-row.type.ts
 * @feature lessons
 * @purpose 学员课时变动记录 ViewModel
 */

export type LessonRecordRow = {
  id: string
  quantity: number
  note: string | null
  purchasedAt: string
  recordType: "purchase" | "adjustment"
}

export type LessonSummary = {
  totalPurchased: number
  totalConsumed: number
  balance: number
}

export type StudentLessonRecords = {
  summary: LessonSummary
  records: LessonRecordRow[]
}
