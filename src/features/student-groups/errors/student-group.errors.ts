/**
 * @file student-group.errors.ts
 * @feature student-groups
 */

export const STUDENT_GROUP_ERROR_MESSAGES = {
  GROUP_ID_REQUIRED: "无效的分组",
  GROUP_NAME_REQUIRED: "请输入分组名称",
  GROUP_NAME_TOO_LONG: "分组名称不能超过 40 个字符",
  GROUP_NOT_FOUND: "找不到该分组",
  STUDENT_IDS_REQUIRED: "请至少选择一名学员",
  STUDENT_ID_INVALID: "无效的学员",
  INTERNAL_ERROR: "操作失败，请稍后重试",
} as const
