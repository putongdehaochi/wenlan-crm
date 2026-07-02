/**
 * @file attendance-statistics.mapper.ts
 * @feature attendance
 * @purpose Statistics 聚合 → Summary；ranking · trend · remaining rank 装配
 *
 * 禁止：Repository 调用 · Service 调用 · students.services 层
 */

import type { AttendanceMonthlyTrendPoint } from "@/features/attendance/types/attendance-monthly-trend-point.type"
import type {
  AttendanceStatisticsSummary,
  RemainingLessonRankRow,
} from "@/features/attendance/types/attendance-statistics-summary.type"
import type { MonthlyAttendanceAggregateRow } from "@/features/attendance/types/monthly-attendance-aggregate-row.type"
import type { StudentAggregateRow } from "@/features/attendance/types/student-aggregate-row.type"
import type { StudentEntity } from "@/features/students/types/student-entity.type"

export type StatisticsAggregateInput = {
  dateFromLabel?: string
  dateToLabel?: string
  totalAttendance: number
  validAttendance: number
  voidedAttendance: number
  restoreCount: number
  checkInCount: number
  voidEventCount: number
  studentAggregates: StudentAggregateRow[]
  rankCandidateAggregates: StudentAggregateRow[]
  monthlyAggregates: MonthlyAttendanceAggregateRow[]
  studentMap: Map<string, StudentEntity>
  balanceMap: Map<string, number>
}

function parseMonthParts(dateLabel: string): { year: number; month: number } {
  const [year, month] = dateLabel.split("-").map(Number)
  return { year, month }
}

function enumerateMonths(
  dateFromLabel: string,
  dateToLabel: string
): string[] {
  const start = parseMonthParts(dateFromLabel)
  const end = parseMonthParts(dateToLabel)
  const months: string[] = []
  let year = start.year
  let month = start.month

  while (year < end.year || (year === end.year && month <= end.month)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`)
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return months
}

export function toMonthlyTrendPoints(
  sparse: MonthlyAttendanceAggregateRow[],
  dateFromLabel?: string,
  dateToLabel?: string
): AttendanceMonthlyTrendPoint[] {
  if (dateFromLabel && dateToLabel) {
    const lookup = new Map(
      sparse.map((row) => [row.month, row.validAttendanceCount])
    )
    return enumerateMonths(dateFromLabel, dateToLabel).map((month) => ({
      month,
      validAttendanceCount: lookup.get(month) ?? 0,
    }))
  }

  return [...sparse]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((row) => ({
      month: row.month,
      validAttendanceCount: row.validAttendanceCount,
    }))
}

export function toStudentRankRows(
  aggregates: StudentAggregateRow[],
  studentMap: Map<string, StudentEntity>
): AttendanceStatisticsSummary["studentRank"] {
  return aggregates.map((row, index) => ({
    studentId: row.studentId,
    studentName: studentMap.get(row.studentId)?.name ?? "未知学员",
    validAttendance: row.validAttendance,
    rank: index + 1,
  }))
}

export function toRemainingLessonRankRows(
  candidates: StudentAggregateRow[],
  balanceMap: Map<string, number>,
  studentMap: Map<string, StudentEntity>
): RemainingLessonRankRow[] {
  const rows = candidates.map((candidate) => ({
    studentId: candidate.studentId,
    studentName: studentMap.get(candidate.studentId)?.name ?? "未知学员",
    remainingLessons: balanceMap.get(candidate.studentId) ?? 0,
  }))

  rows.sort((left, right) => {
    if (right.remainingLessons !== left.remainingLessons) {
      return right.remainingLessons - left.remainingLessons
    }
    const nameOrder = left.studentName.localeCompare(right.studentName, "zh-CN")
    if (nameOrder !== 0) {
      return nameOrder
    }
    return left.studentId.localeCompare(right.studentId)
  })

  return rows.map((row, index) => ({
    rank: index + 1,
    studentId: row.studentId,
    studentName: row.studentName,
    remainingLessons: row.remainingLessons,
  }))
}

export function toAttendanceStatisticsSummary(
  input: StatisticsAggregateInput
): AttendanceStatisticsSummary {
  return {
    dateFrom: input.dateFromLabel,
    dateTo: input.dateToLabel,
    totalAttendance: input.totalAttendance,
    validAttendance: input.validAttendance,
    voidedAttendance: input.voidedAttendance,
    restoreCount: input.restoreCount,
    consumedLessons: input.validAttendance,
    checkInCount: input.checkInCount,
    voidEventCount: input.voidEventCount,
    studentRank: toStudentRankRows(input.studentAggregates, input.studentMap),
    monthlyTrend: toMonthlyTrendPoints(
      input.monthlyAggregates,
      input.dateFromLabel,
      input.dateToLabel
    ),
    remainingLessonRank: toRemainingLessonRankRows(
      input.rankCandidateAggregates,
      input.balanceMap,
      input.studentMap
    ),
  }
}
