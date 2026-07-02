/**
 * @file attendance-history-row.tsx
 * @feature attendance
 * @purpose 签到历史单行；展示 ViewModel，触发撤销 / 恢复回调
 */

"use client"

import type { AttendanceHistoryRow as AttendanceHistoryRowType } from "@/features/attendance/types/attendance-history-row.type"
import { formatDateTime } from "@/shared/lib/format-datetime"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableRow } from "@/shared/components/ui/table"

type AttendanceHistoryRowProps = {
  row: AttendanceHistoryRowType
  onVoidClick: (row: AttendanceHistoryRowType) => void
  onRestoreClick: (row: AttendanceHistoryRowType) => void
}

function formatStatus(status: AttendanceHistoryRowType["status"]): string {
  return status === "VALID" ? "有效" : "已撤销"
}

export function AttendanceHistoryRow({
  row,
  onVoidClick,
  onRestoreClick,
}: AttendanceHistoryRowProps) {
  return (
    <TableRow>
      <TableCell>{row.attendanceDate}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDateTime(row.checkedInAt)}
      </TableCell>
      <TableCell className="font-medium">{row.studentName}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <span>{formatStatus(row.status)}</span>
          {row.status === "VOIDED" && row.voidedAt && (
            <span className="text-xs text-muted-foreground">
              撤销 {formatDateTime(row.voidedAt)}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {row.canVoid ? (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => onVoidClick(row)}
          >
            撤销
          </Button>
        ) : row.canRestore ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onRestoreClick(row)}
          >
            恢复
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  )
}
