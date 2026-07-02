/**
 * @file create-lesson-purchase.validator.ts
 * @feature lessons
 * @purpose Create Lesson Purchase 入参校验；由 Service 调用
 */

import {
  LESSON_ERROR_MESSAGES,
  QUANTITY_MAX,
} from "@/features/lessons/errors/lesson.errors"
import type { CreateLessonPackageEntityInput } from "@/features/lessons/types/lesson-package-entity.type"
import type { CreateLessonPurchaseInput } from "@/features/lessons/types/create-lesson-purchase-input.type"
import { validateOptionalNote } from "@/features/lessons/validators/rules/optional-note.rule"
import { validatePositiveInteger } from "@/features/lessons/validators/rules/positive-integer.rule"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/lessons/validators/validation-result.type"

export function validateCreateLessonPurchaseInput(
  input: CreateLessonPurchaseInput
): ValidationResult<CreateLessonPackageEntityInput> {
  const fieldErrors = mergeFieldErrors(
    collectFieldError(
      "studentId",
      validateStudentId(input.studentId, LESSON_ERROR_MESSAGES.STUDENT_ID_REQUIRED)
    ),
    collectFieldError(
      "quantity",
      validatePositiveInteger(input.quantity, {
        requiredMessage: LESSON_ERROR_MESSAGES.QUANTITY_REQUIRED,
        positiveMessage: LESSON_ERROR_MESSAGES.QUANTITY_POSITIVE,
        max: QUANTITY_MAX,
        maxMessage: LESSON_ERROR_MESSAGES.QUANTITY_MAX,
      })
    ),
    collectFieldError("note", validateOptionalNote(input.note))
  )

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  const quantity =
    typeof input.quantity === "number" ? input.quantity : Number(input.quantity)

  return {
    success: true,
    data: {
      studentId: input.studentId.trim(),
      quantity,
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
