/**
 * @file adjust-lesson-balance.validator.ts
 * @feature lessons
 * @purpose 课时调整入参校验
 */

import {
  LESSON_ERROR_MESSAGES,
  QUANTITY_MAX,
} from "@/features/lessons/errors/lesson.errors"
import type { AdjustLessonBalanceInput } from "@/features/lessons/types/adjust-lesson-balance-input.type"
import type { CreateLessonPackageEntityInput } from "@/features/lessons/types/lesson-package-entity.type"
import { validateNonZeroInteger } from "@/features/lessons/validators/rules/non-zero-integer.rule"
import { validateOptionalNote } from "@/features/lessons/validators/rules/optional-note.rule"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/lessons/validators/validation-result.type"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"

const ADJUSTMENT_NOTE_PREFIX = "【调整】"

export function validateAdjustLessonBalanceInput(
  input: AdjustLessonBalanceInput
): ValidationResult<CreateLessonPackageEntityInput> {
  const fieldErrors = mergeFieldErrors(
    collectFieldError(
      "studentId",
      validateStudentId(input.studentId, LESSON_ERROR_MESSAGES.STUDENT_ID_REQUIRED)
    ),
    collectFieldError(
      "quantityDelta",
      validateNonZeroInteger(input.quantityDelta, {
        requiredMessage: LESSON_ERROR_MESSAGES.DELTA_REQUIRED,
        nonzeroMessage: LESSON_ERROR_MESSAGES.DELTA_NONZERO,
        max: QUANTITY_MAX,
        maxMessage: LESSON_ERROR_MESSAGES.DELTA_MAX,
      })
    ),
    collectFieldError("note", validateAdjustmentNote(input.note))
  )

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  const quantityDelta =
    typeof input.quantityDelta === "number"
      ? input.quantityDelta
      : Number(input.quantityDelta)

  const note = normalizeRequiredNote(input.note)

  return {
    success: true,
    data: {
      studentId: input.studentId.trim(),
      quantity: quantityDelta,
      note: `${ADJUSTMENT_NOTE_PREFIX}${note}`,
    },
  }
}

function validateAdjustmentNote(value: unknown): string | null {
  if (value == null || (typeof value === "string" && value.trim().length === 0)) {
    return LESSON_ERROR_MESSAGES.ADJUST_NOTE_REQUIRED
  }
  return validateOptionalNote(value)
}

function collectFieldError(
  field: string,
  error: string | null
): Record<string, string> {
  return error ? { [field]: error } : {}
}

function normalizeRequiredNote(value: string): string {
  return value.trim()
}

export function isAdjustmentRecord(note: string | null): boolean {
  return note?.startsWith(ADJUSTMENT_NOTE_PREFIX) ?? false
}

export function formatAdjustmentNote(note: string | null): string | null {
  if (!note) {
    return null
  }
  if (note.startsWith(ADJUSTMENT_NOTE_PREFIX)) {
    return note.slice(ADJUSTMENT_NOTE_PREFIX.length)
  }
  return note
}
