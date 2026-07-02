/**
 * @file student-lesson-records-panel.tsx
 * @feature lessons
 * @purpose 学员课时统计与变动记录
 */

"use client"

import type { StudentLessonRecords } from "@/features/lessons/types/lesson-record-row.type"
import { formatDateTime } from "@/shared/lib/format-datetime"

type StudentLessonRecordsPanelProps = {
  records: StudentLessonRecords | null
  loading: boolean
  error: string | null
}

function formatQuantity(quantity: number): string {
  return quantity > 0 ? `+${quantity}` : String(quantity)
}

function formatRecordType(type: StudentLessonRecords["records"][number]["recordType"]): string {
  return type === "adjustment" ? "调整" : "购课"
}

export function StudentLessonRecordsPanel({
  records,
  loading,
  error,
}: StudentLessonRecordsPanelProps) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">课时记录加载中…</p>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }

  if (!records) {
    return null
  }

  const { summary } = records

  return (
    <div className="mt-6 space-y-4 border-t border-border/80 pt-4">
      <div>
        <h3 className="text-sm font-semibold">课时统计</h3>
        <dl className="mt-2 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">已录入总量</dt>
            <dd className="font-medium">{summary.totalPurchased}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">已消耗</dt>
            <dd className="font-medium">{summary.totalConsumed}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">当前余额</dt>
            <dd className="font-medium">{summary.balance}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-semibold">课时记录</h3>
        {records.records.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">暂无课时记录</p>
        ) : (
          <ul className="mt-2 max-h-48 space-y-2 overflow-auto">
            {records.records.map((record) => (
              <li
                key={record.id}
                className="rounded-lg border border-border/70 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={
                      record.quantity > 0
                        ? "font-medium text-emerald-700"
                        : "font-medium text-destructive"
                    }
                  >
                    {formatQuantity(record.quantity)} 课时
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatRecordType(record.recordType)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(record.purchasedAt)}
                </p>
                {record.note && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {record.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
