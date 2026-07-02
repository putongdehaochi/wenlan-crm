/**
 * @file lesson-package-entity.type.ts
 * @feature lessons
 * @purpose LessonPackage 持久化 Entity；Repository 层专用，不含 ViewModel 字段
 */

/** 与 lesson_packages 表列一一对应；不含 lessonBalance（ADR-004、ADR-007） */
export type LessonPackageEntity = {
  id: string
  studentId: string
  quantity: number
  note: string | null
  purchasedAt: Date
  createdAt: Date
}

/** Repository create 写入入参；Service 层校验后传入 */
export type CreateLessonPackageEntityInput = {
  studentId: string
  quantity: number
  note: string | null
}
