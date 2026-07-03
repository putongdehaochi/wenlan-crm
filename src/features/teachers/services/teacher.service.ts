/**
 * @file teacher.service.ts
 * @feature teachers
 */

import { TEACHER_ERROR_MESSAGES } from "@/features/teachers/errors/teacher.errors"
import { toTeacherSummary, toTeacherSummaryList } from "@/features/teachers/mappers/teacher.mapper"
import { teacherRepository } from "@/features/teachers/repositories/teacher.repository"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import {
  validateCreateTeacherInput,
  validateTeacherId,
  validateUpdateTeacherInput,
} from "@/features/teachers/validators/teacher.validator"
import type { ActionResult } from "@/shared/types/action-result.type"

export type TeacherActionResult<T> = ActionResult<T>

export async function listTeachers(): Promise<
  TeacherActionResult<TeacherSummary[]>
> {
  try {
    const entities = await teacherRepository.findAll()
    return {
      success: true,
      data: toTeacherSummaryList(entities),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: TEACHER_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function createTeacher(input: {
  name: string
}): Promise<TeacherActionResult<TeacherSummary>> {
  const validation = validateCreateTeacherInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const entity = await teacherRepository.create(validation.data.name)
    return { success: true, data: toTeacherSummary(entity) }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: TEACHER_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function updateTeacher(input: {
  id: string
  name: string
}): Promise<TeacherActionResult<TeacherSummary>> {
  const validation = validateUpdateTeacherInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const existing = await teacherRepository.findById(validation.data.id)
    if (!existing) {
      return {
        success: false,
        errorType: "TEACHER_NOT_FOUND",
        message: TEACHER_ERROR_MESSAGES.TEACHER_NOT_FOUND,
      }
    }

    const entity = await teacherRepository.update(
      validation.data.id,
      validation.data.name
    )
    return { success: true, data: toTeacherSummary(entity) }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: TEACHER_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function setDefaultTeacher(
  id: unknown
): Promise<TeacherActionResult<TeacherSummary>> {
  const validation = validateTeacherId(id)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const existing = await teacherRepository.findById(validation.data)
    if (!existing) {
      return {
        success: false,
        errorType: "TEACHER_NOT_FOUND",
        message: TEACHER_ERROR_MESSAGES.TEACHER_NOT_FOUND,
      }
    }

    const entity = await teacherRepository.setDefault(validation.data)
    return { success: true, data: toTeacherSummary(entity) }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: TEACHER_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function deleteTeacher(
  id: unknown
): Promise<TeacherActionResult<{ id: string }>> {
  const validation = validateTeacherId(id)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const existing = await teacherRepository.findById(validation.data)
    if (!existing) {
      return {
        success: false,
        errorType: "TEACHER_NOT_FOUND",
        message: TEACHER_ERROR_MESSAGES.TEACHER_NOT_FOUND,
      }
    }

    if (existing.isDefault) {
      return {
        success: false,
        errorType: "CANNOT_DELETE_DEFAULT_TEACHER",
        message: TEACHER_ERROR_MESSAGES.CANNOT_DELETE_DEFAULT,
      }
    }

    const usageCount = await teacherRepository.countAttendances(validation.data)
    if (usageCount > 0) {
      return {
        success: false,
        errorType: "TEACHER_IN_USE",
        message: TEACHER_ERROR_MESSAGES.TEACHER_IN_USE,
      }
    }

    await teacherRepository.remove(validation.data)
    return { success: true, data: { id: validation.data } }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: TEACHER_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export const teacherService = {
  listTeachers,
  createTeacher,
  updateTeacher,
  setDefaultTeacher,
  deleteTeacher,
}
