/**
 * @file create-student-input.type.ts
 * @feature students
 * @purpose Create Student 原始入参（表单 / Action 边界）
 */

export type CreateStudentInput = {
  name: string
  contactName: string
  phone?: string | null
  note?: string | null
}
