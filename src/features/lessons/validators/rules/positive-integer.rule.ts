/**
 * @file positive-integer.rule.ts
 * @feature lessons
 * @purpose 正整数校验（购课课时数）
 */

export function validatePositiveInteger(
  value: unknown,
  options: {
    requiredMessage: string
    positiveMessage: string
    max?: number
    maxMessage?: string
  }
): string | null {
  if (value == null || value === "") {
    return options.requiredMessage
  }

  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(num)) {
    return options.positiveMessage
  }
  if (num < 1) {
    return options.positiveMessage
  }
  if (options.max != null && num > options.max) {
    return options.maxMessage ?? options.positiveMessage
  }

  return null
}
