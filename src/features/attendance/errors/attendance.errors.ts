/**
 * @file attendance.errors.ts
 * @feature attendance
 * @purpose 签到模块错误码与默认消息
 */

export const ATTENDANCE_ERROR_MESSAGES = {
  STUDENT_ID_REQUIRED: "无效的学员",
  ATTENDANCE_ID_REQUIRED: "无效的签到记录",
  ATTENDANCE_DATE_INVALID: "无效的签到日期",
  HISTORY_LIMIT_INVALID: "无效的记录数量限制",
  STUDENT_NOT_FOUND: "找不到该学员",
  STUDENT_ARCHIVED: "该学员已归档，无法签到",
  ALREADY_CHECKED_IN: "今日已签到",
  VOIDED_TODAY_RESTORE_REQUIRED:
    "今日签到已撤销，请点「恢复签到」重新生效，不能再次签到",
  INSUFFICIENT_BALANCE: "课时不足，请续费",
  ATTENDANCE_NOT_FOUND: "找不到该签到记录",
  ALREADY_VOIDED: "该签到已撤销",
  ALREADY_VALID: "该签到已有效，无需恢复",
  HISTORY_DATE_RANGE_INVALID: "日期范围无效",
  AUDIT_STATUS_INVALID: "无效的签到状态",
  AUDIT_FILTER_RESERVED: "该筛选条件尚未开放",
  STATISTICS_FILTER_RESERVED: "该筛选条件尚未开放",
  INTERNAL_ERROR: "操作失败，请稍后重试",
} as const
