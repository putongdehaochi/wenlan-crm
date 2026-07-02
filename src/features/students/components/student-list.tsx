/**
 * @file student-list.tsx
 * @feature students
 * @purpose 学生列表与空状态；点击行触发查看详情
 */

"use client"

import { ChevronRight } from "lucide-react"

import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { Button } from "@/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

type StudentListProps = {
  summaries: StudentSummary[]
  onSelect: (id: string) => void
  onCreateClick: () => void
  hasSearchQuery?: boolean
}

function formatStatus(status: StudentSummary["status"]): string {
  return status === "ACTIVE" ? "在读" : status
}

function formatPhone(phone: string | null): string {
  return phone ?? "—"
}

export function StudentList({
  summaries,
  onSelect,
  onCreateClick,
  hasSearchQuery = false,
}: StudentListProps) {
  if (summaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16 text-center">
        <p className="text-muted-foreground">
          {hasSearchQuery ? "未找到匹配的学员" : "暂无学员"}
        </p>
        {!hasSearchQuery && (
          <>
            <p className="text-sm text-muted-foreground">
              点击「新增学生」开始登记
            </p>
            <Button type="button" onClick={onCreateClick}>
              新增学生
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        点击表格行或右侧「查看详情」打开学员抽屉，可录入课时、查看记录与签到数据。
      </p>
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>联系人</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>课时余额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaries.map((student) => (
              <TableRow
                key={student.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => onSelect(student.id)}
              >
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.contactName}</TableCell>
                <TableCell>{formatPhone(student.phone)}</TableCell>
                <TableCell>{student.lessonBalance}</TableCell>
                <TableCell>{formatStatus(student.status)}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 text-primary"
                    onClick={(event) => {
                      event.stopPropagation()
                      onSelect(student.id)
                    }}
                  >
                    查看详情
                    <ChevronRight className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
