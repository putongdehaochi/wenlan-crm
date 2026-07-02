/**
 * @file void-attendance-result.type.ts
 * @feature attendance
 * @purpose 撤销签到成功 ViewModel
 */

export type VoidAttendanceResult = {
  attendanceId: string
  studentId: string
  attendanceDate: string
  status: "VOIDED"
  lessonBalance: number
}
