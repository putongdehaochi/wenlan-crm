/**
 * @file find-audit-input.type.ts
 * @feature attendance
 * @purpose findAuditList 入参；Repository + Service 共用（Sprint 7 冻结）
 */

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"

export type FindAuditInput = {
  studentId?: string
  dateFrom?: Date | string
  dateTo?: Date | string
  status?: AttendanceStatus
  /** Reserved — Sprint 7 不实现 */
  teacherId?: string
  /** Reserved — Sprint 7 不实现 */
  classId?: string
  /** Reserved — Sprint 7 不实现 */
  cursor?: string
  limit?: number
}
