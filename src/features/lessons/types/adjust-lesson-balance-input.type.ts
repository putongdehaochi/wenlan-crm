/**
 * @file adjust-lesson-balance-input.type.ts
 * @feature lessons
 * @purpose 课时调整入参（可增可减）
 */

export type AdjustLessonBalanceInput = {
  studentId: string
  quantityDelta: number
  note: string
}
