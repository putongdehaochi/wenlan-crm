/**
 * @file action-result.type.ts
 * @feature shared
 * @purpose Service / Action 统一返回结构（Student + Lesson 共用）
 */

export type ActionErrorType =
  | "VALIDATION_ERROR"
  | "DUPLICATE_STUDENT"
  | "STUDENT_NOT_FOUND"
  | "STUDENT_ARCHIVED"
  | "ALREADY_CHECKED_IN"
  | "VOIDED_TODAY"
  | "INSUFFICIENT_BALANCE"
  | "ATTENDANCE_NOT_FOUND"
  | "ALREADY_VOIDED"
  | "ALREADY_VALID"
  | "GROUP_NOT_FOUND"
  | "TEACHER_NOT_FOUND"
  | "CANNOT_DELETE_DEFAULT_TEACHER"
  | "TEACHER_IN_USE"
  | "INTERNAL_ERROR"

export type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false
      errorType: ActionErrorType
      message?: string
      fieldErrors?: FieldErrors
    }

export type FieldErrors = Record<string, string>

/** @deprecated 使用 ActionResult；保留别名便于 Student 模块渐进迁移 */
export type StudentErrorType = Extract<
  ActionErrorType,
  "VALIDATION_ERROR" | "DUPLICATE_STUDENT" | "STUDENT_NOT_FOUND" | "INTERNAL_ERROR"
>

export type StudentActionResult<T> = ActionResult<T>

export type LessonErrorType = Extract<
  ActionErrorType,
  "VALIDATION_ERROR" | "STUDENT_NOT_FOUND" | "STUDENT_ARCHIVED" | "INTERNAL_ERROR"
>

export type LessonActionResult<T> = ActionResult<T>

export type AttendanceErrorType = Extract<
  ActionErrorType,
  | "VALIDATION_ERROR"
  | "STUDENT_NOT_FOUND"
  | "STUDENT_ARCHIVED"
  | "ALREADY_CHECKED_IN"
  | "VOIDED_TODAY"
  | "INSUFFICIENT_BALANCE"
  | "ATTENDANCE_NOT_FOUND"
  | "ALREADY_VOIDED"
  | "ALREADY_VALID"
  | "INTERNAL_ERROR"
>

export type AttendanceActionResult<T> = ActionResult<T>
