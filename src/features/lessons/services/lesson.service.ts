/**
 * @file lesson.service.ts
 * @feature lessons
 * @purpose 课时模块业务入口；Validator → Repository → Mapper
 *
 * Sprint 3: 单表 INSERT，不开启 Transaction（见 Plan §7.2）
 */

import { LESSON_ERROR_MESSAGES } from "@/features/lessons/errors/lesson.errors"
import {
  toLessonPurchaseResult,
  toLessonRecordListRows,
  toStudioLessonStatistics,
  toStudentLessonRecords,
} from "@/features/lessons/mappers/lesson.mapper"
import { lessonBalanceRepository } from "@/features/lessons/repositories/lesson-balance.repository"
import { lessonPackageRepository } from "@/features/lessons/repositories/lesson-package.repository"
import type { AdjustLessonBalanceInput } from "@/features/lessons/types/adjust-lesson-balance-input.type"
import type { CreateLessonPurchaseInput } from "@/features/lessons/types/create-lesson-purchase-input.type"
import type { FindLessonRecordsInput } from "@/features/lessons/types/lesson-record-list-row.type"
import type { StudioLessonStatistics } from "@/features/lessons/types/lesson-record-list-row.type"
import type { LessonPurchaseResult } from "@/features/lessons/types/lesson-purchase-result.type"
import type { LessonRecordListRow } from "@/features/lessons/types/lesson-record-list-row.type"
import type { StudentLessonRecords } from "@/features/lessons/types/lesson-record-row.type"
import { validateAdjustLessonBalanceInput } from "@/features/lessons/validators/adjust-lesson-balance.validator"
import { validateCreateLessonPurchaseInput } from "@/features/lessons/validators/create-lesson-purchase.validator"
import { studentRepository } from "@/features/students/repositories/student.repository"
import type { LessonActionResult } from "@/shared/types/action-result.type"

function isCheckConstraintViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false
  }

  const maybeCode = (error as { code?: string }).code
  if (maybeCode === "P2004") {
    return true
  }

  const message = String((error as { message?: string }).message ?? "")
  return (
    message.includes("lesson_packages_quantity_positive") ||
    message.includes("lesson_packages_quantity_nonzero") ||
    message.includes("check constraint")
  )
}

export async function createLessonPurchase(
  input: CreateLessonPurchaseInput
): Promise<LessonActionResult<LessonPurchaseResult>> {
  const validation = validateCreateLessonPurchaseInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { studentId, quantity, note } = validation.data
    const student = await studentRepository.findById(studentId)

    if (!student) {
      return {
        success: false,
        errorType: "STUDENT_NOT_FOUND",
        message: LESSON_ERROR_MESSAGES.STUDENT_NOT_FOUND,
      }
    }

    if (student.status === "ARCHIVED") {
      return {
        success: false,
        errorType: "STUDENT_ARCHIVED",
        message: LESSON_ERROR_MESSAGES.STUDENT_ARCHIVED,
      }
    }

    const entity = await lessonPackageRepository.create({
      studentId,
      quantity,
      note,
    })

    const lessonBalance = await lessonBalanceRepository.getBalance(studentId)

    return {
      success: true,
      data: toLessonPurchaseResult(entity, lessonBalance),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: LESSON_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function listStudentLessonRecords(
  studentId: string
): Promise<LessonActionResult<StudentLessonRecords>> {
  const trimmedId = studentId.trim()
  if (!trimmedId) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: { studentId: LESSON_ERROR_MESSAGES.STUDENT_ID_REQUIRED },
    }
  }

  try {
    const student = await studentRepository.findById(trimmedId)
    if (!student) {
      return {
        success: false,
        errorType: "STUDENT_NOT_FOUND",
        message: LESSON_ERROR_MESSAGES.STUDENT_NOT_FOUND,
      }
    }

    const [entities, summary] = await Promise.all([
      lessonPackageRepository.findByStudentId(trimmedId),
      lessonBalanceRepository.getLessonSummary(trimmedId),
    ])

    return {
      success: true,
      data: toStudentLessonRecords(entities, summary),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: LESSON_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function listLessonRecords(
  input: FindLessonRecordsInput = {}
): Promise<LessonActionResult<LessonRecordListRow[]>> {
  try {
    const entities = await lessonPackageRepository.findAll(input)
    const studentIds = [...new Set(entities.map((entity) => entity.studentId))]
    const students = await studentRepository.findByIds(studentIds)
    const studentMap = new Map(students.map((student) => [student.id, student]))

    return {
      success: true,
      data: toLessonRecordListRows(entities, studentMap),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: LESSON_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function getStudioLessonStatistics(): Promise<
  LessonActionResult<StudioLessonStatistics>
> {
  try {
    const students = await studentRepository.findAllActive()
    const studentIds = students.map((student) => student.id)

    const summary = await lessonBalanceRepository.getStudioLessonSummary()
    const counts = await lessonPackageRepository.countByRecordType()
    const balanceMap = await lessonBalanceRepository.getBalances(studentIds)
    const metrics =
      await lessonBalanceRepository.getStudioStudentMetricMaps(studentIds)

    return {
      success: true,
      data: toStudioLessonStatistics({
        activeStudentCount: students.length,
        summary,
        purchaseCount: counts.purchaseCount,
        adjustmentCount: counts.adjustmentCount,
        students,
        balanceMap,
        recordedMap: metrics.recordedMap,
        consumedMap: metrics.consumedMap,
      }),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: LESSON_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function adjustLessonBalance(
  input: AdjustLessonBalanceInput
): Promise<LessonActionResult<LessonPurchaseResult>> {
  const validation = validateAdjustLessonBalanceInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { studentId, quantity, note } = validation.data
    const student = await studentRepository.findById(studentId)

    if (!student) {
      return {
        success: false,
        errorType: "STUDENT_NOT_FOUND",
        message: LESSON_ERROR_MESSAGES.STUDENT_NOT_FOUND,
      }
    }

    if (student.status === "ARCHIVED") {
      return {
        success: false,
        errorType: "STUDENT_ARCHIVED",
        message: LESSON_ERROR_MESSAGES.STUDENT_ARCHIVED,
      }
    }

    const currentBalance = await lessonBalanceRepository.getBalance(studentId)
    if (currentBalance + quantity < 0) {
      return {
        success: false,
        errorType: "VALIDATION_ERROR",
        fieldErrors: {
          quantityDelta: LESSON_ERROR_MESSAGES.BALANCE_INSUFFICIENT,
        },
      }
    }

    const entity = await lessonPackageRepository.create({
      studentId,
      quantity,
      note,
    })

    const lessonBalance = await lessonBalanceRepository.getBalance(studentId)

    return {
      success: true,
      data: toLessonPurchaseResult(entity, lessonBalance),
    }
  } catch (error) {
    if (isCheckConstraintViolation(error)) {
      return {
        success: false,
        errorType: "VALIDATION_ERROR",
        fieldErrors: {
          quantityDelta:
            "课时调整失败：请确认数据库已执行最新迁移（允许负数课时调整）",
        },
      }
    }

    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: LESSON_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export const lessonService = {
  createLessonPurchase,
  listStudentLessonRecords,
  listLessonRecords,
  getStudioLessonStatistics,
  adjustLessonBalance,
}
