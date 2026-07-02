/**
 * @file student-detail-view.tsx
 * @feature students
 * @purpose 只读学生详情；含课时记录与快捷入口
 */

"use client"

import Link from "next/link"

import { StudentLessonRecordsPanel } from "@/features/lessons/components/student-lesson-records-panel"
import type { StudentLessonRecords } from "@/features/lessons/types/lesson-record-row.type"
import type { StudentDetail } from "@/features/students/types/student-detail.type"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { formatDateTime } from "@/shared/lib/format-datetime"

type StudentDetailViewProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail: StudentDetail | null
  loading: boolean
  error: string | null
  lessonRecords: StudentLessonRecords | null
  lessonRecordsLoading: boolean
  lessonRecordsError: string | null
  onPurchaseClick?: () => void
  onAdjustClick?: () => void
}

function formatStatus(status: StudentDetail["status"]): string {
  return status === "ACTIVE" ? "在读" : status
}

function formatOptional(value: string | null): string {
  return value ?? "—"
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

export function StudentDetailView({
  open,
  onOpenChange,
  detail,
  loading,
  error,
  lessonRecords,
  lessonRecordsLoading,
  lessonRecordsError,
  onPurchaseClick,
  onAdjustClick,
}: StudentDetailViewProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>学生详情</SheetTitle>
          <SheetDescription>
            查看学员资料、课时记录与签到快捷入口
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {loading && (
            <p className="text-sm text-muted-foreground">加载中…</p>
          )}
          {!loading && error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!loading && !error && detail && (
            <>
              <dl className="grid gap-4">
                <DetailField label="姓名" value={detail.name} />
                <DetailField label="联系人" value={detail.contactName} />
                <DetailField label="电话" value={formatOptional(detail.phone)} />
                <DetailField label="备注" value={formatOptional(detail.note)} />
                <DetailField label="状态" value={formatStatus(detail.status)} />
                <DetailField
                  label="课时余额"
                  value={String(detail.lessonBalance)}
                />
                <DetailField
                  label="登记时间"
                  value={formatDateTime(detail.createdAt)}
                />
              </dl>

              <StudentLessonRecordsPanel
                records={lessonRecords}
                loading={lessonRecordsLoading}
                error={lessonRecordsError}
              />

              <div className="mt-6 flex flex-col gap-2 border-t border-border/80 pt-4">
                <Link
                  href={`/students/lesson-records?studentId=${detail.id}`}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  查看课时记录
                </Link>
                <Link
                  href="/students/lesson-statistics"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  查看课时统计
                </Link>
                <Link
                  href={`/attendance/history?studentId=${detail.id}`}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  查看签到历史
                </Link>
                <Link
                  href={`/attendance/audit?studentId=${detail.id}`}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  查看签到审计
                </Link>
                <Link
                  href={`/attendance/statistics?studentId=${detail.id}`}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  查看签到统计
                </Link>
                {detail.status === "ACTIVE" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {onPurchaseClick && (
                      <Button type="button" onClick={onPurchaseClick}>
                        录入课时
                      </Button>
                    )}
                    {onAdjustClick && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onAdjustClick}
                      >
                        课时调整
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
