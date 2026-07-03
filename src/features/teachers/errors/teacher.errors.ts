/**
 * @file teacher.errors.ts
 * @feature teachers
 */

export const TEACHER_ERROR_MESSAGES = {
  TEACHER_ID_REQUIRED: "无效的老师",
  TEACHER_NAME_REQUIRED: "请输入老师姓名",
  TEACHER_NAME_TOO_LONG: "老师姓名不能超过 20 个字符",
  TEACHER_NOT_FOUND: "找不到该老师",
  CANNOT_DELETE_DEFAULT: "不能删除系统默认老师，请先指定其他默认老师",
  TEACHER_IN_USE: "该老师已有签到记录，无法删除",
  INTERNAL_ERROR: "操作失败，请稍后重试",
} as const
