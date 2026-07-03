/**
 * @file batch-check-in-result.type.ts
 * @feature attendance
 */

import type { CheckInResult } from "@/features/attendance/types/check-in-result.type"

export type BatchCheckInFailure = {
  studentId: string
  studentName?: string
  message: string
}

export type BatchCheckInResult = {
  succeeded: CheckInResult[]
  failed: BatchCheckInFailure[]
}
