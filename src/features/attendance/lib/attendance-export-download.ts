/**
 * @file attendance-export-download.ts
 * @feature attendance
 * @purpose 浏览器侧触发 CSV 下载；仅消费 AttendanceExportPayload
 */

import type { AttendanceExportPayload } from "@/features/attendance/types/attendance-export-payload.type"

export function downloadAttendanceExportPayload(
  payload: AttendanceExportPayload
): void {
  const blob = new Blob([payload.content], { type: payload.mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = payload.fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
