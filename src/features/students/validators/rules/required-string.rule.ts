/**
 * @file required-string.rule.ts
 * @feature students
 * @purpose 必填字符串校验（trim 后长度 ≥ 1）
 */

export function validateRequiredString(
  value: unknown,
  message: string
): string | null {
  if (typeof value !== "string") {
    return message
  }
  if (value.trim().length < 1) {
    return message
  }
  return null
}
