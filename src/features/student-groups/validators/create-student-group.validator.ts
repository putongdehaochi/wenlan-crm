/**
 * @file create-student-group.validator.ts
 * @feature student-groups
 */

import { STUDENT_GROUP_ERROR_MESSAGES } from "@/features/student-groups/errors/student-group.errors"
import type { CreateStudentGroupEntityInput } from "@/features/student-groups/types/student-group-entity.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/student-groups/validators/validation-result.type"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"

const MAX_NAME_LENGTH = 40

export function validateCreateStudentGroupInput(
  input: CreateStudentGroupEntityInput
): ValidationResult<CreateStudentGroupEntityInput> {
  const fieldErrors = mergeFieldErrors()

  const name = input.name?.trim() ?? ""
  if (!name) {
    fieldErrors.name = STUDENT_GROUP_ERROR_MESSAGES.GROUP_NAME_REQUIRED
  } else if (name.length > MAX_NAME_LENGTH) {
    fieldErrors.name = STUDENT_GROUP_ERROR_MESSAGES.GROUP_NAME_TOO_LONG
  }

  const studentIds = input.studentIds ?? []
  if (studentIds.length === 0) {
    fieldErrors.studentIds = STUDENT_GROUP_ERROR_MESSAGES.STUDENT_IDS_REQUIRED
  } else {
    for (const studentId of studentIds) {
      const error = validateStudentId(
        studentId,
        STUDENT_GROUP_ERROR_MESSAGES.STUDENT_ID_INVALID
      )
      if (error) {
        fieldErrors.studentIds = error
        break
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  return {
    success: true,
    data: {
      name,
      studentIds: [...new Set(studentIds.map((id) => id.trim()))],
      teacherId: normalizeOptionalTeacherId(input.teacherId),
    },
  }
}

function normalizeOptionalTeacherId(
  value: unknown
): string | null | undefined {
  if (value === undefined) {
    return undefined
  }
  if (value === null || value === "") {
    return null
  }
  const trimmed = String(value).trim()
  return trimmed || null
}

export function validateUpdateStudentGroupInput(input: {
  id: unknown
  name?: unknown
  studentIds?: unknown
  teacherId?: unknown
}): ValidationResult<{
  id: string
  name?: string
  studentIds?: string[]
  teacherId?: string | null
}> {
  const fieldErrors = mergeFieldErrors()

  const idError = validateStudentId(
    input.id,
    STUDENT_GROUP_ERROR_MESSAGES.GROUP_ID_REQUIRED
  )
  if (idError) {
    fieldErrors.id = idError
  }

  let name: string | undefined
  if (input.name !== undefined) {
    name = String(input.name).trim()
    if (!name) {
      fieldErrors.name = STUDENT_GROUP_ERROR_MESSAGES.GROUP_NAME_REQUIRED
    } else if (name.length > MAX_NAME_LENGTH) {
      fieldErrors.name = STUDENT_GROUP_ERROR_MESSAGES.GROUP_NAME_TOO_LONG
    }
  }

  let studentIds: string[] | undefined
  if (input.studentIds !== undefined) {
    if (!Array.isArray(input.studentIds)) {
      fieldErrors.studentIds = STUDENT_GROUP_ERROR_MESSAGES.STUDENT_IDS_REQUIRED
    } else {
      studentIds = input.studentIds as string[]
      if (studentIds.length === 0) {
        fieldErrors.studentIds = STUDENT_GROUP_ERROR_MESSAGES.STUDENT_IDS_REQUIRED
      } else {
        for (const studentId of studentIds) {
          const error = validateStudentId(
            studentId,
            STUDENT_GROUP_ERROR_MESSAGES.STUDENT_ID_INVALID
          )
          if (error) {
            fieldErrors.studentIds = error
            break
          }
        }
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  const teacherId =
    input.teacherId !== undefined
      ? normalizeOptionalTeacherId(input.teacherId)
      : undefined

  return {
    success: true,
    data: {
      id: String(input.id).trim(),
      name,
      studentIds: studentIds
        ? [...new Set(studentIds.map((id) => id.trim()))]
        : undefined,
      teacherId,
    },
  }
}

export function validateGroupId(id: unknown): ValidationResult<string> {
  const error = validateStudentId(
    id,
    STUDENT_GROUP_ERROR_MESSAGES.GROUP_ID_REQUIRED
  )
  if (error) {
    return { success: false, fieldErrors: { id: error } }
  }
  return { success: true, data: String(id).trim() }
}
