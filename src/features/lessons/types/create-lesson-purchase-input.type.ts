/**
 * @file create-lesson-purchase-input.type.ts
 * @feature lessons
 * @purpose 购课 Action / Service 入参
 */

export type CreateLessonPurchaseInput = {
  studentId: string
  quantity: number
  note?: string | null
}
