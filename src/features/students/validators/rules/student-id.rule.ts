/**
 * @file student-id.rule.ts
 * @feature students
 * @purpose 学员 ID 非空校验
 */

export function validateStudentId(value: unknown, message: string): string | null {
  if (typeof value !== "string") {
    return message
  }
  if (value.trim().length < 1) {
    return message
  }
  return null
}
