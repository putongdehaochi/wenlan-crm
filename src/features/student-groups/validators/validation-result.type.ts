/**
 * @file validation-result.type.ts
 * @feature student-groups
 */

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; fieldErrors: Record<string, string> }

export function mergeFieldErrors(
  ...sources: Record<string, string>[]
): Record<string, string> {
  return Object.assign({}, ...sources)
}
