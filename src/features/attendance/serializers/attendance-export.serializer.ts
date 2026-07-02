/**
 * @file attendance-export.serializer.ts
 * @feature attendance
 * @purpose CSV 序列化；唯一 CSV 生成边界（Sprint 8 RC5）
 */

import type { AttendanceAuditListRow } from "@/features/attendance/types/attendance-audit-list-row.type"
import type { AttendanceExportPayload } from "@/features/attendance/types/attendance-export-payload.type"
import type { AttendanceStatisticsSummary } from "@/features/attendance/types/attendance-statistics-summary.type"

const UTF8_BOM = "\uFEFF"
const MIME_TYPE = "text/csv;charset=utf-8" as const

function formatExportTimestamp(exportedAt: Date): string {
  const year = exportedAt.getFullYear()
  const month = String(exportedAt.getMonth() + 1).padStart(2, "0")
  const day = String(exportedAt.getDate()).padStart(2, "0")
  const hours = String(exportedAt.getHours()).padStart(2, "0")
  const minutes = String(exportedAt.getMinutes()).padStart(2, "0")
  const seconds = String(exportedAt.getSeconds()).padStart(2, "0")
  return `${year}${month}${day}-${hours}${minutes}${seconds}`
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function toCsvLine(fields: string[]): string {
  return fields.map(escapeCsvField).join(",")
}

function withBom(content: string): string {
  return `${UTF8_BOM}${content}`
}

export function toAuditCsvPayload(
  rows: AttendanceAuditListRow[],
  exportedAt: Date
): AttendanceExportPayload {
  const lines = [
    toCsvLine([
      "签到日期",
      "学员姓名",
      "状态",
      "撤销时间",
      "最近事件",
      "最近事件时间",
    ]),
    ...rows.map((row) =>
      toCsvLine([
        row.attendanceDate,
        row.studentName,
        row.status,
        row.voidedAt ?? "",
        row.lastEventType ?? "",
        row.lastEventAt ?? "",
      ])
    ),
  ]

  return {
    fileName: `attendance-audit-${formatExportTimestamp(exportedAt)}.csv`,
    mimeType: MIME_TYPE,
    content: withBom(lines.join("\n")),
  }
}

export function toStatisticsCsvPayload(
  summary: AttendanceStatisticsSummary,
  exportedAt: Date
): AttendanceExportPayload {
  const lines: string[] = [
    toCsvLine(["指标", "数值"]),
    toCsvLine(["总签到次数", String(summary.totalAttendance)]),
    toCsvLine(["有效签到", String(summary.validAttendance)]),
    toCsvLine(["撤销次数", String(summary.voidedAttendance)]),
    toCsvLine(["签到事件数", String(summary.checkInCount)]),
    toCsvLine(["撤销事件数", String(summary.voidEventCount)]),
    toCsvLine(["恢复事件数", String(summary.restoreCount)]),
    "",
    toCsvLine(["月份", "有效签到次数"]),
    ...(summary.monthlyTrend ?? []).map((point) =>
      toCsvLine([point.month, String(point.validAttendanceCount)])
    ),
    "",
    toCsvLine(["排名", "学员姓名", "剩余课时"]),
    ...(summary.remainingLessonRank ?? []).map((row) =>
      toCsvLine([
        String(row.rank),
        row.studentName,
        String(row.remainingLessons),
      ])
    ),
  ]

  return {
    fileName: `attendance-statistics-${formatExportTimestamp(exportedAt)}.csv`,
    mimeType: MIME_TYPE,
    content: withBom(lines.join("\n")),
  }
}
