/**
 * @file restore-attendance-result.type.ts
 * @feature attendance
 * @purpose 恢复签到成功 ViewModel
 */

export type RestoreAttendanceResult = {
  attendanceId: string
  studentId: string
  attendanceDate: string
  status: "VALID"
  lessonBalance: number
  checkedInAt: string
}
