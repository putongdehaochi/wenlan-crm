/**
 * @file check-in-input.type.ts
 * @feature attendance
 * @purpose 签到 Action / Service 入参
 */

export type CheckInInput = {
  studentId: string
  attendanceDate?: Date | string
}

export type ListTodayAttendanceInput = {
  attendanceDate?: Date | string
}
