/**
 * @file attendance-audit-row.tsx
 * @feature attendance
 * @purpose 审计列表单行；展示 ViewModel，点击打开 Timeline
 */

"use client"

import type { AttendanceAuditListRow } from "@/features/attendance/types/attendance-audit-list-row.type"
import type { LifecycleEventType } from "@/features/attendance/types/attendance-lifecycle-event-entity.type"
import { TableCell, TableRow } from "@/shared/components/ui/table"

type AttendanceAuditRowProps = {
  row: AttendanceAuditListRow
  onRowClick: (row: AttendanceAuditListRow) => void
}

function formatStatus(status: AttendanceAuditListRow["status"]): string {
  return status === "VALID" ? "有效" : "已撤销"
}

function formatLastEventType(type: LifecycleEventType | null): string {
  if (!type) return "—"
  switch (type) {
    case "CHECK_IN":
      return "签到"
    case "VOID":
      return "撤销"
    case "RESTORE":
      return "恢复"
  }
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

export function AttendanceAuditRow({ row, onRowClick }: AttendanceAuditRowProps) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onRowClick(row)}
    >
      <TableCell>{row.attendanceDate}</TableCell>
      <TableCell className="font-medium">{row.studentName}</TableCell>
      <TableCell>{row.teacherName ?? "—"}</TableCell>
      <TableCell>{formatStatus(row.status)}</TableCell>
      <TableCell>{formatLastEventType(row.lastEventType)}</TableCell>
      <TableCell>{formatDateTime(row.lastEventAt)}</TableCell>
      <TableCell className="text-muted-foreground">{row.eventCount}</TableCell>
    </TableRow>
  )
}
