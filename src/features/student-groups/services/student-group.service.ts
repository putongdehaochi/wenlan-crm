/**
 * @file student-group.service.ts
 * @feature student-groups
 */

import { STUDENT_GROUP_ERROR_MESSAGES } from "@/features/student-groups/errors/student-group.errors"
import {
  toStudentGroupSummary,
  toStudentGroupSummaryList,
} from "@/features/student-groups/mappers/student-group.mapper"
import { studentGroupRepository } from "@/features/student-groups/repositories/student-group.repository"
import type { StudentGroupSummary } from "@/features/student-groups/types/student-group-summary.type"
import {
  validateCreateStudentGroupInput,
  validateGroupId,
  validateUpdateStudentGroupInput,
} from "@/features/student-groups/validators/create-student-group.validator"
import type { ActionResult } from "@/shared/types/action-result.type"

export type StudentGroupActionResult<T> = ActionResult<T>

export async function listSavedStudentGroups(): Promise<
  StudentGroupActionResult<StudentGroupSummary[]>
> {
  try {
    const entities = await studentGroupRepository.findAllSaved()
    const memberMap = await studentGroupRepository.findMemberStudentIdsMap(
      entities.map((entity) => entity.id)
    )

    return {
      success: true,
      data: toStudentGroupSummaryList(entities, memberMap),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: STUDENT_GROUP_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function getSavedStudentGroup(
  id: unknown
): Promise<StudentGroupActionResult<StudentGroupSummary>> {
  const validation = validateGroupId(id)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const entity = await studentGroupRepository.findById(validation.data)
    if (!entity) {
      return {
        success: false,
        errorType: "GROUP_NOT_FOUND",
        message: STUDENT_GROUP_ERROR_MESSAGES.GROUP_NOT_FOUND,
      }
    }

    const studentIds = await studentGroupRepository.findMemberStudentIds(
      entity.id
    )

    return {
      success: true,
      data: toStudentGroupSummary(entity, studentIds),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: STUDENT_GROUP_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function createSavedStudentGroup(input: {
  name: string
  studentIds: string[]
  teacherId?: string | null
}): Promise<StudentGroupActionResult<StudentGroupSummary>> {
  const validation = validateCreateStudentGroupInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const entity = await studentGroupRepository.create(validation.data)
    return {
      success: true,
      data: toStudentGroupSummary(entity, validation.data.studentIds),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: STUDENT_GROUP_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function updateSavedStudentGroup(input: {
  id: string
  name?: string
  studentIds?: string[]
  teacherId?: string | null
}): Promise<StudentGroupActionResult<StudentGroupSummary>> {
  const validation = validateUpdateStudentGroupInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const existing = await studentGroupRepository.findById(validation.data.id)
    if (!existing) {
      return {
        success: false,
        errorType: "GROUP_NOT_FOUND",
        message: STUDENT_GROUP_ERROR_MESSAGES.GROUP_NOT_FOUND,
      }
    }

    const entity = await studentGroupRepository.update(validation.data.id, {
      name: validation.data.name,
      studentIds: validation.data.studentIds,
      teacherId: validation.data.teacherId,
    })

    const studentIds =
      validation.data.studentIds ??
      (await studentGroupRepository.findMemberStudentIds(entity.id))

    return {
      success: true,
      data: toStudentGroupSummary(entity, studentIds),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: STUDENT_GROUP_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function deleteSavedStudentGroup(
  id: unknown
): Promise<StudentGroupActionResult<{ id: string }>> {
  const validation = validateGroupId(id)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const existing = await studentGroupRepository.findById(validation.data)
    if (!existing) {
      return {
        success: false,
        errorType: "GROUP_NOT_FOUND",
        message: STUDENT_GROUP_ERROR_MESSAGES.GROUP_NOT_FOUND,
      }
    }

    await studentGroupRepository.remove(validation.data)
    return { success: true, data: { id: validation.data } }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: STUDENT_GROUP_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export const studentGroupService = {
  listSavedStudentGroups,
  getSavedStudentGroup,
  createSavedStudentGroup,
  updateSavedStudentGroup,
  deleteSavedStudentGroup,
}
