/**
 * @file attendance-history-row.type.ts
 * @feature attendance
 * @purpose 签到历史列表 ViewModel（ADR-012 RC4 最终冻结）
 */

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"

export type AttendanceHistoryRow = {
  id: string
  studentId: string
  studentName: string
  attendanceDate: string
  quantityConsumed: number
  status: AttendanceStatus
  checkedInAt: string
  voidedAt: string | null
  canVoid: boolean
  canRestore: boolean
  /** Reserved — Sprint 6 不展示 */
  note?: string
  /** Reserved — Sprint 6 不展示 */
  teacherName?: string
  /** Reserved — Sprint 6 不展示 */
  className?: string
}
