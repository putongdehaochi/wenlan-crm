/**
 * @file attendance-today-row.tsx
 * @feature attendance
 * @purpose 今日签到名单单行；展示 ViewModel，触发签到/恢复回调
 */

"use client"

import type { AttendanceTodayRow as AttendanceTodayRowType } from "@/features/attendance/types/attendance-today-row.type"
import { formatDateTime } from "@/shared/lib/format-datetime"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableRow } from "@/shared/components/ui/table"

type AttendanceTodayRowProps = {
  row: AttendanceTodayRowType
  checkingIn: boolean
  restoring: boolean
  error?: string
  onCheckIn: (studentId: string) => void
  onRestore: (attendanceId: string) => void
}

function formatTodayStatus(
  status: AttendanceTodayRowType["todayStatus"]
): string {
  switch (status) {
    case "CHECKED_IN":
      return "已签到"
    case "VOIDED":
      return "已撤销"
    default:
      return "未签到"
  }
}

function formatAttendanceTime(row: AttendanceTodayRowType): string {
  if (row.todayStatus === "CHECKED_IN" && row.checkedInAt) {
    return formatDateTime(row.checkedInAt)
  }
  if (row.todayStatus === "VOIDED" && row.voidedAt) {
    return `撤销 ${formatDateTime(row.voidedAt)}`
  }
  if (row.todayStatus === "VOIDED" && row.checkedInAt) {
    return `签到 ${formatDateTime(row.checkedInAt)}`
  }
  return "—"
}

export function AttendanceTodayRow({
  row,
  checkingIn,
  restoring,
  error,
  onCheckIn,
  onRestore,
}: AttendanceTodayRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{row.name}</TableCell>
      <TableCell>{row.lessonBalance}</TableCell>
      <TableCell>{formatTodayStatus(row.todayStatus)}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {row.teacherName ?? "—"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatAttendanceTime(row)}
      </TableCell>
      <TableCell>
        <div className="flex flex-col items-start gap-1">
          {row.todayStatus === "CHECKED_IN" ? (
            <span className="text-sm text-muted-foreground">已签到</span>
          ) : row.canRestore && row.attendanceId ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={restoring}
              onClick={() => onRestore(row.attendanceId!)}
            >
              {restoring ? "恢复中…" : "恢复签到"}
            </Button>
          ) : row.canCheckIn ? (
            <Button
              type="button"
              size="sm"
              disabled={checkingIn}
              onClick={() => onCheckIn(row.id)}
            >
              {checkingIn ? "签到中…" : "签到"}
            </Button>
          ) : row.todayStatus === "VOIDED" ? (
            <span className="text-sm text-muted-foreground">课时不足，无法恢复</span>
          ) : (
            <span className="text-sm text-muted-foreground">课时不足</span>
          )}
          {error && (
            <span className="max-w-xs text-xs text-destructive" role="alert">
              {error}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
