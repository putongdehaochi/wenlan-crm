/**
 * @file check-in-input.type.ts
 * @feature attendance
 * @purpose 签到 Action / Service 入参
 */

export type CheckInInput = {
  studentId: string
  attendanceDate?: Date | string
  /** 用户手动选择的老师（最高优先级） */
  teacherId?: string
  /** 可选；仅 SAVED 分组 ID，用于记录签到上下文，不影响统计 */
  groupId?: string
}

export type ListTodayAttendanceInput = {
  attendanceDate?: Date | string
  /** SAVED 分组 ID，用于筛选今日名单 */
  groupId?: string
  /** SESSION 分组学员 ID 列表，用于筛选今日名单 */
  studentIds?: string[]
}

export type BatchCheckInInput = {
  studentIds: string[]
  attendanceDate?: Date | string
  teacherId?: string
  groupId?: string
}
