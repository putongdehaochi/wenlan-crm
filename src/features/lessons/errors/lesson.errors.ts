/**
 * @file lesson.errors.ts
 * @feature lessons
 * @purpose 课时模块错误码与默认消息
 */

export const LESSON_ERROR_MESSAGES = {
  STUDENT_ID_REQUIRED: "无效的学员",
  QUANTITY_REQUIRED: "请填写课时数",
  QUANTITY_POSITIVE: "课时数必须大于 0",
  QUANTITY_MAX: "课时数过大",
  DELTA_REQUIRED: "请填写调整课时数",
  DELTA_NONZERO: "调整课时数不能为 0",
  DELTA_MAX: "调整幅度过大",
  ADJUST_NOTE_REQUIRED: "请填写调整原因",
  BALANCE_INSUFFICIENT: "调整后课时余额不能为负数",
  NOTE_MAX_LENGTH: "备注不能超过 500 字",
  STUDENT_NOT_FOUND: "找不到该学员",
  STUDENT_ARCHIVED: "该学员已归档，无法录入课时",
  INTERNAL_ERROR: "操作失败，请稍后重试",
} as const

export const QUANTITY_MAX = 9999
export const NOTE_MAX_LENGTH = 500
