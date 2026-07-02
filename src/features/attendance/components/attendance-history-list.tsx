/**
 * @file attendance-history-list.tsx
 * @feature attendance
 * @purpose 签到历史表格与空状态
 */

"use client"

import { AttendanceHistoryRow } from "@/features/attendance/components/attendance-history-row"
import type { AttendanceHistoryRow as AttendanceHistoryRowType } from "@/features/attendance/types/attendance-history-row.type"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

type AttendanceHistoryListProps = {
  rows: AttendanceHistoryRowType[]
  onVoidClick: (row: AttendanceHistoryRowType) => void
  onRestoreClick: (row: AttendanceHistoryRowType) => void
}

export function AttendanceHistoryList({
  rows,
  onVoidClick,
  onRestoreClick,
}: AttendanceHistoryListProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground">暂无签到记录</p>
        <p className="text-sm text-muted-foreground">
          学员签到后，记录将显示在此处
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>签到日期</TableHead>
          <TableHead>签到时间</TableHead>
          <TableHead>学员姓名</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <AttendanceHistoryRow
            key={row.id}
            row={row}
            onVoidClick={onVoidClick}
            onRestoreClick={onRestoreClick}
          />
        ))}
      </TableBody>
    </Table>
  )
}
