/**
 * @file attendance-entity.type.ts
 * @feature attendance
 * @purpose Attendance 持久化 Entity；Repository 层专用
 */

export type AttendanceStatus = "VALID" | "VOIDED"

/** 与 attendances 表列一一对应；不含 lessonBalance */
export type AttendanceEntity = {
  id: string
  studentId: string
  groupId: string | null
  teacherId: string
  attendanceDate: Date
  status: AttendanceStatus
  voidedAt: Date | null
  createdAt: Date
}

/** Repository create 写入入参；Service 层校验后传入 */
export type CreateAttendanceEntityInput = {
  studentId: string
  attendanceDate: Date
  teacherId?: string
  status?: AttendanceStatus
  groupId?: string
}
