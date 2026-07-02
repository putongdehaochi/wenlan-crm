/**
 * @file non-zero-integer.rule.ts
 * @feature lessons
 * @purpose 非零整数校验（课时调整）
 */

export function validateNonZeroInteger(
  value: unknown,
  options: {
    requiredMessage: string
    nonzeroMessage: string
    max?: number
    maxMessage?: string
  }
): string | null {
  if (value == null || value === "") {
    return options.requiredMessage
  }

  const num = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(num)) {
    return options.nonzeroMessage
  }
  if (num === 0) {
    return options.nonzeroMessage
  }
  if (options.max != null && Math.abs(num) > options.max) {
    return options.maxMessage ?? options.nonzeroMessage
  }

  return null
}
