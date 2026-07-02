/**
 * @file student-entity.type.ts
 * @feature students
 * @purpose Student 持久化 Entity 类型；Repository 层专用，不含 ViewModel 字段
 */

export type StudentStatus = "ACTIVE" | "ARCHIVED"

/** 与 students 表列一一对应；不含 lessonBalance（ADR-004） */
export type StudentEntity = {
  id: string
  name: string
  contactName: string
  phone: string | null
  note: string | null
  status: StudentStatus
  createdAt: Date
  updatedAt: Date
}

/** Repository create 写入入参；Service 层 normalize 后传入 */
export type CreateStudentEntityInput = {
  name: string
  contactName: string
  phone: string | null
  note: string | null
}
