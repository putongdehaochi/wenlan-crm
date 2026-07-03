/**
 * @file attendance-today-list.tsx
 * @feature attendance
 * @purpose 今日签到名单表格与空状态
 */

"use client"

import { AttendanceTodayRow } from "@/features/attendance/components/attendance-today-row"
import type { AttendanceTodayRow as AttendanceTodayRowType } from "@/features/attendance/types/attendance-today-row.type"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

type AttendanceTodayListProps = {
  rows: AttendanceTodayRowType[]
  checkingInId: string | null
  restoringId: string | null
  rowErrors: Record<string, string>
  onCheckIn: (studentId: string) => void
  onRestore: (attendanceId: string) => void
  emptyMessage?: string
}

export function AttendanceTodayList({
  rows,
  checkingInId,
  restoringId,
  rowErrors,
  onCheckIn,
  onRestore,
  emptyMessage,
}: AttendanceTodayListProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground">
          {emptyMessage ?? "暂无在读学员"}
        </p>
        {!emptyMessage && (
          <p className="text-sm text-muted-foreground">
            请先在「学生管理」中登记学员
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>姓名</TableHead>
          <TableHead>课时余额</TableHead>
          <TableHead>今日状态</TableHead>
          <TableHead>时间</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <AttendanceTodayRow
            key={row.id}
            row={row}
            checkingIn={checkingInId === row.id}
            restoring={restoringId === row.attendanceId}
            error={rowErrors[row.id]}
            onCheckIn={onCheckIn}
            onRestore={onRestore}
          />
        ))}
      </TableBody>
    </Table>
    </div>
  )
}
