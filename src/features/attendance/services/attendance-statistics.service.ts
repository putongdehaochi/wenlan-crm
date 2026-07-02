/**
 * @file attendance-statistics.service.ts
 * @feature attendance
 * @purpose 签到统计业务入口；Validator → Statistics Repository → Mapper
 *
 * 禁止：students.services 层调用
 */

import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import { toAttendanceStatisticsSummary } from "@/features/attendance/mappers/attendance-statistics.mapper"
import { attendanceStatisticsRepository } from "@/features/attendance/repositories/attendance-statistics.repository"
import type { AttendanceStatisticsSummary } from "@/features/attendance/types/attendance-statistics-summary.type"
import type { FindStatisticsInput } from "@/features/attendance/types/find-statistics-input.type"
import { validateGetAttendanceStatisticsInput } from "@/features/attendance/validators/get-attendance-statistics.validator"
import { lessonBalanceRepository } from "@/features/lessons/repositories/lesson-balance.repository"
import { studentRepository } from "@/features/students/repositories/student.repository"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

export async function getAttendanceStatistics(
  input: FindStatisticsInput = {}
): Promise<AttendanceActionResult<AttendanceStatisticsSummary>> {
  const validation = validateGetAttendanceStatisticsInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const {
      dateFrom,
      dateTo,
      studentId,
      status,
      rankingLimit,
      dateFromLabel,
      dateToLabel,
    } = validation.data

    const filter: FindStatisticsInput = { dateFrom, dateTo, studentId, status }

    const [totalAttendance, validAttendance, voidedAttendance] =
      await Promise.all([
        attendanceStatisticsRepository.countTotalAttendance(filter),
        attendanceStatisticsRepository.countValidAttendance(filter),
        attendanceStatisticsRepository.countVoidedAttendance(filter),
      ])

    const [restoreCount, checkInCount, voidEventCount] = await Promise.all([
      attendanceStatisticsRepository.countLifecycleEvents(filter, "RESTORE"),
      attendanceStatisticsRepository.countLifecycleEvents(filter, "CHECK_IN"),
      attendanceStatisticsRepository.countLifecycleEvents(filter, "VOID"),
    ])

    const [studentAggregates, rankCandidateAggregates, monthlyAggregates] =
      await Promise.all([
        attendanceStatisticsRepository.groupValidAttendanceByStudent(
          filter,
          rankingLimit
        ),
        attendanceStatisticsRepository.groupAllValidAttendanceByStudent(filter),
        attendanceStatisticsRepository.groupValidAttendanceByMonth(filter),
      ])

    const studentIds = [
      ...new Set([
        ...studentAggregates.map((row) => row.studentId),
        ...rankCandidateAggregates.map((row) => row.studentId),
      ]),
    ]
    const students = await studentRepository.findByIds(studentIds)
    const studentMap = new Map(students.map((student) => [student.id, student]))
    const balanceMap = await lessonBalanceRepository.getBalances(studentIds)

    return {
      success: true,
      data: toAttendanceStatisticsSummary({
        dateFromLabel,
        dateToLabel,
        totalAttendance,
        validAttendance,
        voidedAttendance,
        restoreCount,
        checkInCount,
        voidEventCount,
        studentAggregates,
        rankCandidateAggregates,
        monthlyAggregates,
        studentMap,
        balanceMap,
      }),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: ATTENDANCE_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export const attendanceStatisticsService = {
  getAttendanceStatistics,
}
