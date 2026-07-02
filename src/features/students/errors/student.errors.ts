/**
 * @file student.errors.ts
 * @feature students
 * @purpose 学生模块错误码与默认消息
 */

export const STUDENT_ERROR_MESSAGES = {
  NAME_REQUIRED: "请填写学员姓名",
  CONTACT_REQUIRED: "请填写联系人",
  PHONE_FORMAT: "电话格式不正确",
  NOTE_MAX_LENGTH: "备注不能超过 500 字",
  ID_REQUIRED: "无效的学员 ID",
  DUPLICATE_STUDENT: "该学员可能已存在",
  STUDENT_NOT_FOUND: "找不到该学员",
  INTERNAL_ERROR: "操作失败，请稍后重试",
} as const

export const NOTE_MAX_LENGTH = 500
