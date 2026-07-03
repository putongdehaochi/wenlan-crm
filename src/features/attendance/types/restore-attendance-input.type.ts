/**
 * @file restore-attendance-input.type.ts
 * @feature attendance
 * @purpose 恢复签到 Action / Service 入参
 */

export type RestoreAttendanceInput = {
  attendanceId: string
  /** 恢复时可重新指定授课老师；未传则保留原记录上的 teacherId */
  teacherId?: string
}
