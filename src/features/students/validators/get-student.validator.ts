/**
 * @file get-student.validator.ts
 * @feature students
 * @purpose Get Student Detail 的 id 校验；由 Service 调用
 */

import { STUDENT_ERROR_MESSAGES } from "@/features/students/errors/student.errors"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"
import type { ValidationResult } from "@/features/students/validators/validation-result.type"

export function validateGetStudentId(id: unknown): ValidationResult<string> {
  const error = validateStudentId(id, STUDENT_ERROR_MESSAGES.ID_REQUIRED)
  if (error) {
    return { success: false, fieldErrors: { id: error } }
  }
  return { success: true, data: (id as string).trim() }
}
