/**
 * @file optional-phone.rule.ts
 * @feature students
 * @purpose 可选电话格式校验（7–15 位数字，允许 -）
 */

const PHONE_PATTERN = /^[\d-]{7,15}$/

export function validateOptionalPhone(value: unknown): string | null {
  if (value == null || value === "") {
    return null
  }
  if (typeof value !== "string") {
    return "电话格式不正确"
  }
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return null
  }
  const digitsOnly = trimmed.replace(/-/g, "")
  if (!/^\d+$/.test(digitsOnly) || digitsOnly.length < 7 || digitsOnly.length > 15) {
    return "电话格式不正确"
  }
  if (!PHONE_PATTERN.test(trimmed)) {
    return "电话格式不正确"
  }
  return null
}
