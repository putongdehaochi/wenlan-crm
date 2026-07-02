/**
 * @file attendance-statistics-summary.type.ts
 * @feature attendance
 * @purpose 签到统计概览 ViewModel（RC4 冻结）
 */

import type { AttendanceMonthlyTrendPoint } from "@/features/attendance/types/attendance-monthly-trend-point.type"

export type StudentRankRow = {
  studentId: string
  studentName: string
  validAttendance: number
  rank: number
}

/** Reserved — Sprint 7 不装配 */
export type TeacherRankRow = {
  teacherId: string
  teacherName: string
  validAttendance: number
  rank: number
}

/** Reserved — Sprint 7 不装配 */
export type ClassRankRow = {
  classId: string
  className: string
  validAttendance: number
  rank: number
}

/** @deprecated Sprint 8 使用 AttendanceMonthlyTrendPoint */
export type MonthlyTrendRow = {
  month: string
  validAttendance: number
}

/** Reserved — Sprint 7 不装配 */
export type HeatmapCell = {
  date: string
  count: number
}

/** Reserved — Sprint 7 不装配 */
export type RemainingLessonRankRow = {
  studentId: string
  studentName: string
  remainingLessons: number
  rank: number
}

export type AttendanceStatisticsSummary = {
  dateFrom?: string
  dateTo?: string
  totalAttendance: number
  validAttendance: number
  voidedAttendance: number
  restoreCount: number
  consumedLessons: number
  checkInCount: number
  /** Sprint 8 — VOID Lifecycle Event 次数 */
  voidEventCount: number
  studentRank: StudentRankRow[]
  /** Reserved — Sprint 8 */
  teacherRank?: TeacherRankRow[]
  /** Reserved — Sprint 8 */
  classRank?: ClassRankRow[]
  /** Sprint 8 激活 */
  monthlyTrend?: AttendanceMonthlyTrendPoint[]
  /** Reserved — Sprint 8 */
  heatmap?: HeatmapCell[]
  /** Sprint 8 激活 */
  remainingLessonRank?: RemainingLessonRankRow[]
}
