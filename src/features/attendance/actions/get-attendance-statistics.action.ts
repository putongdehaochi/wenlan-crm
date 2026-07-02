/**
 * @file get-attendance-statistics.action.ts
 * @feature attendance
 * @purpose 签到统计概览；仅调用 Service
 */

"use server"

import { attendanceStatisticsService } from "@/features/attendance/services/attendance-statistics.service"
import type { AttendanceStatisticsSummary } from "@/features/attendance/types/attendance-statistics-summary.type"
import type { FindStatisticsInput } from "@/features/attendance/types/find-statistics-input.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function getAttendanceStatisticsAction(
  input: FindStatisticsInput = {}
): Promise<AttendanceActionResult<AttendanceStatisticsSummary>> {
  return attendanceStatisticsService.getAttendanceStatistics(input)
}
