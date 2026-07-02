/**
 * @file list-students.action.ts
 * @feature students
 * @purpose 加载学生列表；仅调用 Service
 */

"use server"

import { studentService } from "@/features/students/services/student.service"
import type { StudentActionResult } from "@/features/students/types/action-result.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"

export async function listStudentsAction(): Promise<
  StudentActionResult<StudentSummary[]>
> {
  return studentService.listActiveStudents()
}
