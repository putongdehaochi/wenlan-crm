/**
 * @file lesson-records-list.tsx
 * @feature lessons
 */

"use client"

import Link from "next/link"

import type { LessonRecordListRow } from "@/features/lessons/types/lesson-record-list-row.type"
import { formatDateTime } from "@/shared/lib/format-datetime"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

type LessonRecordsListProps = {
  rows: LessonRecordListRow[]
}

function formatQuantity(quantity: number): string {
  return quantity > 0 ? `+${quantity}` : String(quantity)
}

function formatRecordType(type: LessonRecordListRow["recordType"]): string {
  return type === "adjustment" ? "调整" : "购课"
}

export function LessonRecordsList({ rows }: LessonRecordsListProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground">暂无课时记录</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>时间</TableHead>
            <TableHead>学员</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>课时变动</TableHead>
            <TableHead>备注</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(row.purchasedAt)}
              </TableCell>
              <TableCell>
                <Link
                  href={`/students?highlight=${row.studentId}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {row.studentName}
                </Link>
              </TableCell>
              <TableCell>{formatRecordType(row.recordType)}</TableCell>
              <TableCell
                className={
                  row.quantity > 0
                    ? "font-medium text-emerald-700"
                    : "font-medium text-destructive"
                }
              >
                {formatQuantity(row.quantity)}
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                {row.note ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
