/**
 * @file student.service.ts
 * @feature students
 * @purpose 学生模块业务入口；Validator → Repository → Mapper
 */

import { STUDENT_ERROR_MESSAGES } from "@/features/students/errors/student.errors"
import { toDetail, toSummaryList } from "@/features/students/mappers/student.mapper"
import { studentRepository } from "@/features/students/repositories/student.repository"
import type { StudentActionResult } from "@/features/students/types/action-result.type"
import type { CreateStudentInput } from "@/features/students/types/create-student-input.type"
import type { StudentDetail } from "@/features/students/types/student-detail.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { validateCreateStudentInput } from "@/features/students/validators/create-student.validator"
import { validateGetStudentId } from "@/features/students/validators/get-student.validator"
import { lessonBalanceRepository } from "@/features/lessons/repositories/lesson-balance.repository"

export async function listActiveStudents(): Promise<
  StudentActionResult<StudentSummary[]>
> {
  try {
    const entities = await studentRepository.findAllActive()
    const balanceMap = await lessonBalanceRepository.getBalances(
      entities.map((entity) => entity.id)
    )
    return {
      success: true,
      data: toSummaryList(entities, balanceMap),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: STUDENT_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function getStudentDetail(
  id: unknown
): Promise<StudentActionResult<StudentDetail>> {
  const validation = validateGetStudentId(id)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const entity = await studentRepository.findById(validation.data)
    if (!entity) {
      return {
        success: false,
        errorType: "STUDENT_NOT_FOUND",
        message: STUDENT_ERROR_MESSAGES.STUDENT_NOT_FOUND,
      }
    }
    const lessonBalance = await lessonBalanceRepository.getBalance(entity.id)
    return {
      success: true,
      data: toDetail(entity, lessonBalance),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: STUDENT_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function createStudent(
  input: CreateStudentInput
): Promise<StudentActionResult<StudentDetail>> {
  const validation = validateCreateStudentInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { name, contactName, phone, note } = validation.data
    const exists = await studentRepository.existsByNameAndContact(
      name,
      contactName
    )
    if (exists) {
      return {
        success: false,
        errorType: "DUPLICATE_STUDENT",
        message: STUDENT_ERROR_MESSAGES.DUPLICATE_STUDENT,
      }
    }

    const entity = await studentRepository.create({
      name,
      contactName,
      phone,
      note,
    })
    return {
      success: true,
      data: toDetail(entity, 0),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: STUDENT_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export const studentService = {
  listActiveStudents,
  getStudentDetail,
  createStudent,
}
