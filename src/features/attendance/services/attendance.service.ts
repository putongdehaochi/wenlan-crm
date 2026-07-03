/**
 * @file attendance.service.ts
 * @feature attendance
 * @purpose 签到模块业务入口；Validator → Repository → Mapper
 *
 * Check In 固定流程（Tech Lead M2）：
 * Validator → findById → existsToday → getBalance → create → Mapper
 */

import { ATTENDANCE_ERROR_MESSAGES } from "@/features/attendance/errors/attendance.errors"
import {
  groupLifecycleEventsByAttendanceId,
  toAttendanceAuditListRowList,
  toAttendanceAuditTimeline,
} from "@/features/attendance/mappers/attendance-audit.mapper"
import {
  toAttendanceHistoryRowList,
  toRestoreAttendanceResult,
  toVoidAttendanceResult,
} from "@/features/attendance/mappers/attendance-history.mapper"
import {
  toCheckInResult,
  toTodayRowList,
} from "@/features/attendance/mappers/attendance.mapper"
import { attendanceRepository } from "@/features/attendance/repositories/attendance.repository"
import { attendanceLifecycleRepository } from "@/features/attendance/repositories/attendance-lifecycle.repository"
import type { AttendanceAuditListRow } from "@/features/attendance/types/attendance-audit-list-row.type"
import type { AttendanceAuditTimeline } from "@/features/attendance/types/attendance-audit-timeline.type"
import type { AttendanceHistoryRow } from "@/features/attendance/types/attendance-history-row.type"
import type { AttendanceTodayRow } from "@/features/attendance/types/attendance-today-row.type"
import type {
  CheckInInput,
  BatchCheckInInput,
  ListTodayAttendanceInput,
} from "@/features/attendance/types/check-in-input.type"
import type { BatchCheckInResult } from "@/features/attendance/types/batch-check-in-result.type"
import type { CheckInResult } from "@/features/attendance/types/check-in-result.type"
import type { FindHistoryInput } from "@/features/attendance/types/find-history-input.type"
import type { FindAuditInput } from "@/features/attendance/types/find-audit-input.type"
import type { GetAttendanceAuditTimelineInput } from "@/features/attendance/types/get-attendance-audit-timeline-input.type"
import type { RestoreAttendanceInput } from "@/features/attendance/types/restore-attendance-input.type"
import type { RestoreAttendanceResult } from "@/features/attendance/types/restore-attendance-result.type"
import type { VoidAttendanceInput } from "@/features/attendance/types/void-attendance-input.type"
import type { VoidAttendanceResult } from "@/features/attendance/types/void-attendance-result.type"
import {
  validateCheckInInput,
  validateListTodayAttendanceInput,
} from "@/features/attendance/validators/check-in.validator"
import { validateListAttendanceHistoryInput } from "@/features/attendance/validators/list-attendance-history.validator"
import { validateListAttendanceAuditInput } from "@/features/attendance/validators/list-attendance-audit.validator"
import { validateGetAttendanceAuditTimelineInput } from "@/features/attendance/validators/get-attendance-audit-timeline.validator"
import { validateRestoreAttendanceInput } from "@/features/attendance/validators/restore-attendance.validator"
import { validateVoidAttendanceInput } from "@/features/attendance/validators/void-attendance.validator"
import { lessonBalanceRepository } from "@/features/lessons/repositories/lesson-balance.repository"
import { resolveTeacherId } from "@/features/attendance/lib/resolve-teacher-id"
import { studentGroupRepository } from "@/features/student-groups/repositories/student-group.repository"
import { STUDENT_GROUP_ERROR_MESSAGES } from "@/features/student-groups/errors/student-group.errors"
import { teacherRepository } from "@/features/teachers/repositories/teacher.repository"
import { toTeacherNameMap } from "@/features/teachers/mappers/teacher.mapper"
import { studentRepository } from "@/features/students/repositories/student.repository"
import type { StudentEntity } from "@/features/students/types/student-entity.type"
import type { AttendanceActionResult } from "@/shared/types/action-result.type"

async function resolveCheckInTeacherId(input: {
  manualTeacherId?: string
  groupId?: string
}): Promise<
  | { success: true; teacherId: string }
  | { success: false; result: AttendanceActionResult<never> }
> {
  const defaultTeacher = await teacherRepository.findDefault()
  let groupTeacherId: string | null = null

  if (input.groupId) {
    const group = await studentGroupRepository.findById(input.groupId)
    if (!group) {
      return {
        success: false,
        result: {
          success: false,
          errorType: "GROUP_NOT_FOUND",
          message: STUDENT_GROUP_ERROR_MESSAGES.GROUP_NOT_FOUND,
        },
      }
    }
    groupTeacherId = group.teacherId
  }

  const teacherId = resolveTeacherId({
    manualTeacherId: input.manualTeacherId,
    groupTeacherId,
    defaultTeacherId: defaultTeacher.id,
  })

  const teacher = await teacherRepository.findById(teacherId)
  if (!teacher) {
    return {
      success: false,
      result: {
        success: false,
        errorType: "TEACHER_NOT_FOUND",
        message: ATTENDANCE_ERROR_MESSAGES.TEACHER_NOT_FOUND,
      },
    }
  }

  return { success: true, teacherId }
}

export async function listTodayAttendance(
  input: ListTodayAttendanceInput = {}
): Promise<AttendanceActionResult<AttendanceTodayRow[]>> {
  const validation = validateListTodayAttendanceInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { attendanceDate, groupId, studentIds } = validation.data

    let entities: StudentEntity[]
    if (groupId) {
      const memberIds =
        await studentGroupRepository.findMemberStudentIds(groupId)
      entities = await studentRepository.findActiveByIds(memberIds)
    } else if (studentIds !== undefined && studentIds.length > 0) {
      entities = await studentRepository.findActiveByIds(studentIds)
    } else {
      entities = await studentRepository.findAllActive()
    }

    const ids = entities.map((entity) => entity.id)

    const detailsMap = await attendanceRepository.getTodayDetailsMap(
      ids,
      attendanceDate
    )
    const balanceMap = await lessonBalanceRepository.getBalances(ids)

    return {
      success: true,
      data: toTodayRowList(entities, balanceMap, detailsMap),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: ATTENDANCE_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function checkInStudent(
  input: CheckInInput
): Promise<AttendanceActionResult<CheckInResult>> {
  const validation = validateCheckInInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { studentId, attendanceDate, groupId, teacherId: manualTeacherId } =
      validation.data

    const teacherResolution = await resolveCheckInTeacherId({
      manualTeacherId,
      groupId,
    })
    if (!teacherResolution.success) {
      return teacherResolution.result
    }

    const student = await studentRepository.findById(studentId)
    if (!student) {
      return {
        success: false,
        errorType: "STUDENT_NOT_FOUND",
        message: ATTENDANCE_ERROR_MESSAGES.STUDENT_NOT_FOUND,
      }
    }

    if (student.status === "ARCHIVED") {
      return {
        success: false,
        errorType: "STUDENT_ARCHIVED",
        message: ATTENDANCE_ERROR_MESSAGES.STUDENT_ARCHIVED,
      }
    }

    const alreadyCheckedIn = await attendanceRepository.existsToday(
      studentId,
      attendanceDate
    )
    if (alreadyCheckedIn) {
      return {
        success: false,
        errorType: "ALREADY_CHECKED_IN",
        message: ATTENDANCE_ERROR_MESSAGES.ALREADY_CHECKED_IN,
      }
    }

    const todayRecord = await attendanceRepository.findTodayByStudent(
      studentId,
      attendanceDate
    )
    if (todayRecord?.status === "VOIDED") {
      return {
        success: false,
        errorType: "VOIDED_TODAY",
        message: ATTENDANCE_ERROR_MESSAGES.VOIDED_TODAY_RESTORE_REQUIRED,
      }
    }

    const lessonBalance = await lessonBalanceRepository.getBalance(studentId)
    if (lessonBalance < 1) {
      return {
        success: false,
        errorType: "INSUFFICIENT_BALANCE",
        message: ATTENDANCE_ERROR_MESSAGES.INSUFFICIENT_BALANCE,
      }
    }

    const entity = await attendanceRepository.create({
      studentId,
      attendanceDate,
      groupId,
      teacherId: teacherResolution.teacherId,
    })

    const balanceAfter = await lessonBalanceRepository.getBalance(studentId)

    return {
      success: true,
      data: toCheckInResult(entity, balanceAfter),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: ATTENDANCE_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function batchCheckInStudents(
  input: BatchCheckInInput
): Promise<AttendanceActionResult<BatchCheckInResult>> {
  if (!Array.isArray(input.studentIds) || input.studentIds.length === 0) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: {
        studentIds: ATTENDANCE_ERROR_MESSAGES.STUDENT_ID_REQUIRED,
      },
    }
  }

  const uniqueIds = [...new Set(input.studentIds.map((id) => id.trim()))]
  const succeeded: BatchCheckInResult["succeeded"] = []
  const failed: BatchCheckInResult["failed"] = []

  for (const studentId of uniqueIds) {
    const result = await checkInStudent({
      studentId,
      attendanceDate: input.attendanceDate,
      groupId: input.groupId,
      teacherId: input.teacherId,
    })

    if (result.success) {
      succeeded.push(result.data)
      continue
    }

    const student = await studentRepository.findById(studentId)
    failed.push({
      studentId,
      studentName: student?.name,
      message:
        result.errorType === "VALIDATION_ERROR"
          ? Object.values(result.fieldErrors ?? {}).join("；") || "签到失败"
          : (result.message ?? "签到失败"),
    })
  }

  return {
    success: true,
    data: { succeeded, failed },
  }
}

export async function listAttendanceHistory(
  input: FindHistoryInput = {}
): Promise<AttendanceActionResult<AttendanceHistoryRow[]>> {
  const validation = validateListAttendanceHistoryInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { studentId, limit, dateFrom, dateTo } = validation.data

    if (studentId) {
      const student = await studentRepository.findById(studentId)
      if (!student) {
        return {
          success: false,
          errorType: "STUDENT_NOT_FOUND",
          message: ATTENDANCE_ERROR_MESSAGES.STUDENT_NOT_FOUND,
        }
      }
    }

    const entities = await attendanceRepository.findHistory({
      studentId,
      limit,
      dateFrom,
      dateTo,
    })
    const uniqueStudentIds = [...new Set(entities.map((entity) => entity.studentId))]
    const uniqueTeacherIds = [...new Set(entities.map((entity) => entity.teacherId))]
    const [students, teachers] = await Promise.all([
      studentRepository.findByIds(uniqueStudentIds),
      teacherRepository.findByIds(uniqueTeacherIds),
    ])
    const studentMap = new Map(students.map((student) => [student.id, student]))
    const teacherNameMap = toTeacherNameMap(teachers)

    return {
      success: true,
      data: toAttendanceHistoryRowList(entities, studentMap, teacherNameMap),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: ATTENDANCE_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function voidAttendance(
  input: VoidAttendanceInput
): Promise<AttendanceActionResult<VoidAttendanceResult>> {
  const validation = validateVoidAttendanceInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { attendanceId } = validation.data

    const existing = await attendanceRepository.findById(attendanceId)
    if (!existing) {
      return {
        success: false,
        errorType: "ATTENDANCE_NOT_FOUND",
        message: ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_NOT_FOUND,
      }
    }

    if (existing.status === "VOIDED") {
      return {
        success: false,
        errorType: "ALREADY_VOIDED",
        message: ATTENDANCE_ERROR_MESSAGES.ALREADY_VOIDED,
      }
    }

    const entity = await attendanceRepository.void(attendanceId)
    const lessonBalance = await lessonBalanceRepository.getBalance(entity.studentId)

    return {
      success: true,
      data: toVoidAttendanceResult(entity, lessonBalance),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: ATTENDANCE_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function restoreAttendance(
  input: RestoreAttendanceInput
): Promise<AttendanceActionResult<RestoreAttendanceResult>> {
  const validation = validateRestoreAttendanceInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { attendanceId } = validation.data

    const existing = await attendanceRepository.findById(attendanceId)
    if (!existing) {
      return {
        success: false,
        errorType: "ATTENDANCE_NOT_FOUND",
        message: ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_NOT_FOUND,
      }
    }

    if (existing.status === "VALID") {
      return {
        success: false,
        errorType: "ALREADY_VALID",
        message: ATTENDANCE_ERROR_MESSAGES.ALREADY_VALID,
      }
    }

    const currentBalance = await lessonBalanceRepository.getBalance(
      existing.studentId
    )
    if (currentBalance < 1) {
      return {
        success: false,
        errorType: "INSUFFICIENT_BALANCE",
        message: ATTENDANCE_ERROR_MESSAGES.INSUFFICIENT_BALANCE,
      }
    }

    const entity = await attendanceRepository.restore(attendanceId)
    const lessonBalance = await lessonBalanceRepository.getBalance(entity.studentId)

    return {
      success: true,
      data: toRestoreAttendanceResult(entity, lessonBalance),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: ATTENDANCE_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function listAttendanceAudit(
  input: FindAuditInput = {}
): Promise<AttendanceActionResult<AttendanceAuditListRow[]>> {
  const validation = validateListAttendanceAuditInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { studentId, limit, dateFrom, dateTo, status } = validation.data

    if (studentId) {
      const student = await studentRepository.findById(studentId)
      if (!student) {
        return {
          success: false,
          errorType: "STUDENT_NOT_FOUND",
          message: ATTENDANCE_ERROR_MESSAGES.STUDENT_NOT_FOUND,
        }
      }
    }

    const entities = await attendanceRepository.findAuditList({
      studentId,
      limit,
      dateFrom,
      dateTo,
      status,
    })

    const attendanceIds = entities.map((entity) => entity.id)
    const lifecycleEvents =
      await attendanceLifecycleRepository.findByAttendanceIds(attendanceIds)
    const eventsByAttendanceId =
      groupLifecycleEventsByAttendanceId(lifecycleEvents)

    const uniqueStudentIds = [...new Set(entities.map((entity) => entity.studentId))]
    const uniqueTeacherIds = [...new Set(entities.map((entity) => entity.teacherId))]
    const [students, teachers] = await Promise.all([
      studentRepository.findByIds(uniqueStudentIds),
      teacherRepository.findByIds(uniqueTeacherIds),
    ])
    const studentMap = new Map(students.map((student) => [student.id, student]))
    const teacherNameMap = toTeacherNameMap(teachers)

    return {
      success: true,
      data: toAttendanceAuditListRowList(
        entities,
        studentMap,
        eventsByAttendanceId,
        teacherNameMap
      ),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: ATTENDANCE_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export async function getAttendanceAuditTimeline(
  input: GetAttendanceAuditTimelineInput
): Promise<AttendanceActionResult<AttendanceAuditTimeline>> {
  const validation = validateGetAttendanceAuditTimelineInput(input)
  if (!validation.success) {
    return {
      success: false,
      errorType: "VALIDATION_ERROR",
      fieldErrors: validation.fieldErrors,
    }
  }

  try {
    const { attendanceId } = validation.data

    const entity = await attendanceRepository.findById(attendanceId)
    if (!entity) {
      return {
        success: false,
        errorType: "ATTENDANCE_NOT_FOUND",
        message: ATTENDANCE_ERROR_MESSAGES.ATTENDANCE_NOT_FOUND,
      }
    }

    const events =
      await attendanceLifecycleRepository.findByAttendanceId(attendanceId)
    const student = await studentRepository.findById(entity.studentId)

    return {
      success: true,
      data: toAttendanceAuditTimeline(entity, student ?? undefined, events),
    }
  } catch {
    return {
      success: false,
      errorType: "INTERNAL_ERROR",
      message: ATTENDANCE_ERROR_MESSAGES.INTERNAL_ERROR,
    }
  }
}

export const attendanceService = {
  listTodayAttendance,
  checkInStudent,
  batchCheckInStudents,
  listAttendanceHistory,
  voidAttendance,
  restoreAttendance,
  listAttendanceAudit,
  getAttendanceAuditTimeline,
}

export const attendanceAuditService = {
  listAttendanceAudit,
  getAttendanceAuditTimeline,
}
