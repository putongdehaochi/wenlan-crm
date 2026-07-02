/**
 * @file optional-note.rule.ts
 * @feature lessons
 * @purpose 可选备注长度校验
 */

import { NOTE_MAX_LENGTH } from "@/features/lessons/errors/lesson.errors"

export function validateOptionalNote(value: unknown): string | null {
  if (value == null || value === "") {
    return null
  }
  if (typeof value !== "string") {
    return `备注不能超过 ${NOTE_MAX_LENGTH} 字`
  }
  if (value.length > NOTE_MAX_LENGTH) {
    return `备注不能超过 ${NOTE_MAX_LENGTH} 字`
  }
  return null
}
