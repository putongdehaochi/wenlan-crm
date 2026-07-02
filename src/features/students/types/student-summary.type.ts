/**
 * @file student-summary.type.ts
 * @feature students
 * @purpose 学生列表 ViewModel；含 lessonBalance 查询结果字段
 */

import type { StudentStatus } from "@/features/students/types/student-entity.type"

export type StudentSummary = {
  id: string
  name: string
  contactName: string
  phone: string | null
  status: StudentStatus
  lessonBalance: number
}
