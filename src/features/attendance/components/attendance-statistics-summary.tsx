/**
 * @file attendance-statistics-summary.tsx
 * @feature attendance
 * @purpose 统计概览展示；直接消费 AttendanceStatisticsSummary
 */

"use client"

import { AttendanceMonthlyTrend } from "@/features/attendance/components/attendance-monthly-trend"
import { AttendanceOverviewCharts } from "@/features/attendance/components/attendance-overview-charts"
import { AttendanceRemainingRank } from "@/features/attendance/components/attendance-remaining-rank"
import type { AttendanceStatisticsSummary } from "@/features/attendance/types/attendance-statistics-summary.type"

type AttendanceStatisticsSummaryViewProps = {
  summary: AttendanceStatisticsSummary
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

export function AttendanceStatisticsSummaryView({
  summary,
}: AttendanceStatisticsSummaryViewProps) {
  const dateRangeLabel =
    summary.dateFrom || summary.dateTo
      ? `${summary.dateFrom ?? "…"} — ${summary.dateTo ?? "…"}`
      : "全部日期"

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted-foreground">统计范围：{dateRangeLabel}</p>

      <section>
        <h2 className="mb-4 text-sm font-medium">签到概览</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="总签到次数" value={summary.totalAttendance} />
          <MetricCard label="有效签到" value={summary.validAttendance} />
          <MetricCard label="已撤销" value={summary.voidedAttendance} />
          <MetricCard label="课消总量" value={summary.consumedLessons} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium">生命周期统计</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard label="Restore 次数" value={summary.restoreCount} />
          <MetricCard label="签到事件数" value={summary.checkInCount} />
          <MetricCard label="撤销事件数" value={summary.voidEventCount} />
        </div>
      </section>

      <AttendanceOverviewCharts
        summary={summary}
        studentRank={summary.studentRank}
      />

      {summary.monthlyTrend && (
        <AttendanceMonthlyTrend points={summary.monthlyTrend} />
      )}

      {summary.remainingLessonRank && (
        <AttendanceRemainingRank rows={summary.remainingLessonRank} />
      )}
    </div>
  )
}
