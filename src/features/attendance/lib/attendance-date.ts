/**
 * @file attendance-date.ts
 * @feature attendance
 * @purpose 签到业务日（服务器本地自然日）归一化
 */

/** 将 Date 或 ISO 日期字符串归一化为本地日历日（用于 attendance_date 存储与查询） */
export function toAttendanceDate(date: Date | string = new Date()): Date {
  const value = typeof date === "string" ? new Date(date) : date
  const year = value.getFullYear()
  const month = value.getMonth()
  const day = value.getDate()
  return new Date(Date.UTC(year, month, day))
}
