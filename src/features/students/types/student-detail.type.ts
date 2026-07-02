/**
 * @file student-detail.type.ts
 * @feature students
 * @purpose 学生详情 ViewModel；只读展示用
 */

import type { StudentStatus } from "@/features/students/types/student-entity.type"

export type StudentDetail = {
  id: string
  name: string
  contactName: string
  phone: string | null
  note: string | null
  status: StudentStatus
  lessonBalance: number
  createdAt: Date
}
