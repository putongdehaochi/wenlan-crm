/**
 * @file teacher.validator.ts
 * @feature teachers
 */

import { TEACHER_ERROR_MESSAGES } from "@/features/teachers/errors/teacher.errors"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"

const MAX_NAME_LENGTH = 20

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; fieldErrors: Record<string, string> }

export function validateTeacherId(id: unknown): ValidationResult<string> {
  const error = validateStudentId(id, TEACHER_ERROR_MESSAGES.TEACHER_ID_REQUIRED)
  if (error) {
    return { success: false, fieldErrors: { id: error } }
  }
  return { success: true, data: String(id).trim() }
}

function validateTeacherName(name: unknown): ValidationResult<string> {
  const trimmed = String(name ?? "").trim()
  if (!trimmed) {
    return {
      success: false,
      fieldErrors: { name: TEACHER_ERROR_MESSAGES.TEACHER_NAME_REQUIRED },
    }
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return {
      success: false,
      fieldErrors: { name: TEACHER_ERROR_MESSAGES.TEACHER_NAME_TOO_LONG },
    }
  }
  return { success: true, data: trimmed }
}

export function validateCreateTeacherInput(input: {
  name: unknown
}): ValidationResult<{ name: string }> {
  const nameValidation = validateTeacherName(input.name)
  if (!nameValidation.success) {
    return nameValidation
  }

  return {
    success: true,
    data: { name: nameValidation.data },
  }
}

export function validateUpdateTeacherInput(input: {
  id: unknown
  name: unknown
}): ValidationResult<{ id: string; name: string }> {
  const idValidation = validateTeacherId(input.id)
  if (!idValidation.success) {
    return idValidation
  }

  const nameValidation = validateTeacherName(input.name)
  if (!nameValidation.success) {
    return nameValidation
  }

  return {
    success: true,
    data: {
      id: idValidation.data,
      name: nameValidation.data,
    },
  }
}
