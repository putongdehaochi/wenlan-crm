/**
 * @file find-history-input.type.ts
 * @feature attendance
 * @purpose findHistory 入参；Repository + Service 共用（ADR-012 RC3 冻结）
 */

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"

export type FindHistoryInput = {
  studentId?: string
  dateFrom?: Date | string
  dateTo?: Date | string
  /** Reserved — Sprint 6 不实现 */
  status?: AttendanceStatus
  /** Reserved — Sprint 6 不实现 */
  teacherId?: string
  /** Reserved — Sprint 6 不实现 */
  classId?: string
  /** Reserved — Sprint 6 不实现 */
  cursor?: string
  limit?: number
}
