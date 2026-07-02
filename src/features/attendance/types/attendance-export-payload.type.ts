/**
 * @file attendance-export-payload.type.ts
 * @feature attendance
 * @purpose Export Action 返回契约（Sprint 8 RC1 冻结）
 */

export type AttendanceExportPayload = {
  fileName: string
  mimeType: "text/csv;charset=utf-8"
  content: string
}
