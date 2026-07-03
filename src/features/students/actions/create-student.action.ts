/**
 * @file create-student.action.ts
 * @feature students
 * @purpose 创建学生；仅调用 Service
 */

"use server"

import { revalidateSharedAppDataPaths } from "@/shared/lib/revalidate-app-paths"
import { studentService } from "@/features/students/services/student.service"
import type { StudentActionResult } from "@/features/students/types/action-result.type"
import type { CreateStudentInput } from "@/features/students/types/create-student-input.type"
import type { StudentDetail } from "@/features/students/types/student-detail.type"

export async function createStudentAction(
  input: CreateStudentInput
): Promise<StudentActionResult<StudentDetail>> {
  const result = await studentService.createStudent(input)
  if (result.success) {
    revalidateSharedAppDataPaths()
  }
  return result
}
