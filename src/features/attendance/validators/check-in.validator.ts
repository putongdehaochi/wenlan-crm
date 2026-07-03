/**
 * @file check-in.validator.ts
 * @feature attendance
 * @purpose Check In 入参校验；由 Service 调用
 */

import { toAttendanceDate } from "@/features/attendance/lib/attendance-date"
import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import type {
  CheckInInput,
  ListTodayAttendanceInput,
} from "@/features/attendance/types/check-in-input.type"
import {
  mergeFieldErrors,
  type ValidationResult,
} from "@/features/attendance/validators/validation-result.type"
import { validateStudentId } from "@/features/students/validators/rules/student-id.rule"

export type ValidatedCheckInInput = {
  studentId: string
  attendanceDate: Date
  teacherId?: string
  groupId?: string
}

export type ValidatedListTodayAttendanceInput = {
  attendanceDate: Date
  groupId?: string
  studentIds?: string[]
}

function parseAttendanceDate(value: unknown): Date | null {
  if (value == null || value === "") {
    return toAttendanceDate()
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return toAttendanceDate(value)
  }
  if (typeof value === "string") {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return null
    return toAttendanceDate(parsed)
  }
  return null
}

export function validateCheckInInput(
  input: CheckInInput
): ValidationResult<ValidatedCheckInInput> {
  const fieldErrors = mergeFieldErrors(
    collectFieldError(
      "studentId",
      validateStudentId(
        input.studentId,
        ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED
      )
    )
  )

  const attendanceDate = parseAttendanceDate(input.attendanceDate)
  if (!attendanceDate) {
    fieldErrors.attendanceDate = ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_DATE_INVALID
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  let groupId: string | undefined
  let teacherId: string | undefined

  if (input.groupId !== undefined && input.groupId !== "") {
    const groupIdError = validateStudentId(
      input.groupId,
      ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED
    )
    if (groupIdError) {
      fieldErrors.groupId = groupIdError
    } else {
      groupId = (input.groupId as string).trim()
    }
  }

  if (input.teacherId !== undefined && input.teacherId !== "") {
    const teacherIdError = validateStudentId(
      input.teacherId,
      ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED
    )
    if (teacherIdError) {
      fieldErrors.teacherId = teacherIdError
    } else {
      teacherId = (input.teacherId as string).trim()
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  return {
    success: true,
    data: {
      studentId: (input.studentId as string).trim(),
      attendanceDate: attendanceDate!,
      groupId,
      teacherId,
    },
  }
}

export function validateListTodayAttendanceDate(
  attendanceDate?: Date | string
): ValidationResult<Date> {
  const parsed = parseAttendanceDate(attendanceDate)
  if (!parsed) {
    return {
      success: false,
      fieldErrors: {
        attendanceDate: ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_DATE_INVALID,
      },
    }
  }
  return { success: true, data: parsed }
}

export function validateListTodayAttendanceInput(
  input: ListTodayAttendanceInput = {}
): ValidationResult<ValidatedListTodayAttendanceInput> {
  const dateValidation = validateListTodayAttendanceDate(input.attendanceDate)
  if (!dateValidation.success) {
    return dateValidation
  }

  const fieldErrors = mergeFieldErrors()
  let groupId: string | undefined
  let studentIds: string[] | undefined

  if (input.groupId !== undefined && input.groupId !== "") {
    const groupIdError = validateStudentId(
      input.groupId,
      ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED
    )
    if (groupIdError) {
      fieldErrors.groupId = groupIdError
    } else {
      groupId = (input.groupId as string).trim()
    }
  }

  if (input.studentIds !== undefined) {
    if (!Array.isArray(input.studentIds)) {
      fieldErrors.studentIds = ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED
    } else {
      studentIds = []
      for (const studentId of input.studentIds) {
        const error = validateStudentId(
          studentId,
          ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED
        )
        if (error) {
          fieldErrors.studentIds = error
          break
        }
        studentIds.push(String(studentId).trim())
      }
      studentIds = [...new Set(studentIds)]
    }
  }

  if (groupId && studentIds && studentIds.length > 0) {
    fieldErrors.groupId = "分组与临时学员列表不能同时使用"
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors }
  }

  return {
    success: true,
    data: {
      attendanceDate: dateValidation.data,
      groupId,
      studentIds,
    },
  }
}

function collectFieldError(
  field: string,
  error: string | null
): Record<string, string> {
  return error ? { [field]: error } : {}
}
