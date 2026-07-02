/**
 * @file create-student.validator.ts
 * @feature students
 * @purpose Create Student 入参校验；由 Service 调用
 */

import { STUDENT_ERROR_MESSAGES } from "@/features/students/errors/student.errors"
import type { CreateStudentInput } from "@/features/students/types/create-student-input.type"
import type { CreateStudentEntityInput } from "@/features/students/types/student-entity.type"
import { validateOptionalNote } from "@/features/students/validators/rules/optional-note.rule"
import { validateOptionalPhone } from "@/features/students/validators/rules/optional-phone.rule"
import { validateRequiredString } from "@/features/students/validators/rules/required-string.rule"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/students/validators/validation-result.type"

export function validateCreateStudentInput(
  input: CreateStudentInput
): ValidationResult<CreateStudentEntityInput> {
  const fieldErrors = mergeFieldErrors(
    collectFieldError(
      "name",
      validateRequiredString(input.name, STUDENT_ERROR_MESSAGES.NAME_REQUIRED)
    ),
    collectFieldError(
      "contactName",
      validateRequiredString(
        input.contactName,
        STUDENT_ERROR_MESSAGES.CONTACT_REQUIRED
      )
    ),
    collectFieldError("phone", validateOptionalPhone(input.phone)),
    collectFieldError("note", validateOptionalNote(input.note))
  )

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  return {
    success: true,
    data: {
      name: input.name.trim(),
      contactName: input.contactName.trim(),
      phone: normalizeOptional(input.phone),
      note: normalizeOptional(input.note),
    },
  }
}

function collectFieldError(
  field: string,
  error: string | null
): Record<string, string> {
  return error ? { [field]: error } : {}
}

function normalizeOptional(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}
