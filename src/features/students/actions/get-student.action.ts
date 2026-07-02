/**
 * @file get-student.action.ts
 * @feature students
 * @purpose 获取学生详情；仅调用 Service
 */

"use server"

import { studentService } from "@/features/students/services/student.service"
import type { StudentActionResult } from "@/features/students/types/action-result.type"
import type { StudentDetail } from "@/features/students/types/student-detail.type"

export async function getStudentAction(
  id: string
): Promise<StudentActionResult<StudentDetail>> {
  return studentService.getStudentDetail(id)
}
