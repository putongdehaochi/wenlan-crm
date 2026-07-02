/**
 * @file validation-result.type.ts
 * @feature students
 * @purpose Validator 统一返回结构
 */

import type { FieldErrors } from "@/shared/types/action-result.type"

export type ValidationSuccess<T> = {
  success: true
  data: T
}

export type ValidationFailure = {
  success: false
  fieldErrors: FieldErrors
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

export function mergeFieldErrors(...errors: FieldErrors[]): FieldErrors {
  return Object.assign({}, ...errors)
}
