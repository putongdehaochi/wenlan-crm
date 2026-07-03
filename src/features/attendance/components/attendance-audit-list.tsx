/**
 * @file attendance-audit-list.tsx
 * @feature attendance
 * @purpose 审计列表表格与空状态
 */

"use client"

import { AttendanceAuditRow } from "@/features/attendance/components/attendance-audit-row"
import type { AttendanceAuditListRow } from "@/features/attendance/types/attendance-audit-list-row.type"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

type AttendanceAuditListProps = {
  rows: AttendanceAuditListRow[]
  onRowClick: (row: AttendanceAuditListRow) => void
}

export function AttendanceAuditList({
  rows,
  onRowClick,
}: AttendanceAuditListProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground">暂无审计记录</p>
        <p className="text-sm text-muted-foreground">
          调整筛选条件或等待签到数据产生
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>签到日期</TableHead>
          <TableHead>学员姓名</TableHead>
          <TableHead>授课老师</TableHead>
          <TableHead>当前状态</TableHead>
          <TableHead>最近事件</TableHead>
          <TableHead>最近事件时间</TableHead>
          <TableHead>事件数</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <AttendanceAuditRow key={row.id} row={row} onRowClick={onRowClick} />
        ))}
      </TableBody>
    </Table>
  )
}
