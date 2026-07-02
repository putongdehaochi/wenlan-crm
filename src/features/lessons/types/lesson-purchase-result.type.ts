/**
 * @file lesson-purchase-result.type.ts
 * @feature lessons
 * @purpose 购课成功返回 ViewModel
 */

export type LessonPurchaseResult = {
  id: string
  studentId: string
  quantity: number
  lessonBalance: number
  purchasedAt: Date
}
