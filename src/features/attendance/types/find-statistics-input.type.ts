/**
 * @file find-statistics-input.type.ts
 * @feature attendance
 * @purpose Statistics Repository 聚合筛选入参（Sprint 7 冻结）
 */

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"

export type FindStatisticsInput = {
  dateFrom?: Date | string
  dateTo?: Date | string
  studentId?: string
  status?: AttendanceStatus
  /** Reserved — Sprint 7 不实现 */
  teacherId?: string
  /** Reserved — Sprint 7 不实现 */
  classId?: string
  /** 默认 10 */
  rankingLimit?: number
}