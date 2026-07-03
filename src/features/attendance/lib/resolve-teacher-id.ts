/**
 * @file resolve-teacher-id.ts
 * @feature attendance
 * @purpose 签到 teacherId 决策：手动选择 > Group 默认 > 系统默认
 */

export type ResolveTeacherIdInput = {
  manualTeacherId?: string | null
  groupTeacherId?: string | null
  defaultTeacherId: string
}

export function resolveTeacherId(input: ResolveTeacherIdInput): string {
  const manual = input.manualTeacherId?.trim()
  if (manual) {
    return manual
  }

  const group = input.groupTeacherId?.trim()
  if (group) {
    return group
  }

  return input.defaultTeacherId
}

export function resolveSuggestedTeacherId(input: {
  groupTeacherId?: string | null
  defaultTeacherId: string
}): string {
  return resolveTeacherId({
    groupTeacherId: input.groupTeacherId,
    defaultTeacherId: input.defaultTeacherId,
  })
}
