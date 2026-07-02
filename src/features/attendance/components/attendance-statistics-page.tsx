/**
 * @file attendance-statistics-page.tsx
 * @feature attendance
 * @purpose 签到统计页容器；只读展示
 */

"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { exportAttendanceStatisticsAction } from "@/features/attendance/actions/export-attendance-statistics.action"
import { AttendanceExportDownloadButton } from "@/features/attendance/components/attendance-export-download-button"
import { AttendanceStatisticsFilter } from "@/features/attendance/components/attendance-statistics-filter"
import { AttendanceStatisticsSummaryView } from "@/features/attendance/components/attendance-statistics-summary"
import {
  buildAttendanceStatisticsHref,
  buildGetAttendanceStatisticsInput,
} from "@/features/attendance/lib/attendance-statistics-query"
import type { AttendanceStatisticsSummary } from "@/features/attendance/types/attendance-statistics-summary.type"
import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { PageShell } from "@/shared/components/page-shell"

type AttendanceStatisticsPageProps = {
  students: StudentSummary[]
  initialSummary: AttendanceStatisticsSummary | null
  initialLoadError?: string
  initialFieldErrors?: Record<string, string>
  studentIdFilter?: string
  dateFromFilter?: string
  dateToFilter?: string
  statusFilter?: AttendanceStatus
  filterStudentName?: string
}

export function AttendanceStatisticsPage({
  students,
  initialSummary,
  initialLoadError,
  initialFieldErrors,
  studentIdFilter,
  dateFromFilter,
  dateToFilter,
  statusFilter,
  filterStudentName,
}: AttendanceStatisticsPageProps) {
  const [summary, setSummary] = useState(initialSummary)
  const [loadError, setLoadError] = useState(initialLoadError ?? null)
  const [filterFieldErrors, setFilterFieldErrors] = useState(
    initialFieldErrors ?? {}
  )

  useEffect(() => {
    setSummary(initialSummary)
    setLoadError(initialLoadError ?? null)
    setFilterFieldErrors(initialFieldErrors ?? {})
  }, [
    initialSummary,
    initialLoadError,
    initialFieldErrors,
    studentIdFilter,
    dateFromFilter,
    dateToFilter,
    statusFilter,
  ])

  const filterInput = buildGetAttendanceStatisticsInput({
    studentId: studentIdFilter,
    dateFrom: dateFromFilter,
    dateTo: dateToFilter,
    status: statusFilter,
  })

  return (
    <PageShell
      title="签到统计"
      description="工作室签到与课消数据概览（只读）"
      actions={
        <AttendanceExportDownloadButton
          onExport={() => exportAttendanceStatisticsAction(filterInput)}
        />
      }
    >
      <AttendanceStatisticsFilter
        students={students}
        studentIdFilter={studentIdFilter}
        dateFromFilter={dateFromFilter}
        dateToFilter={dateToFilter}
        statusFilter={statusFilter}
        fieldErrors={filterFieldErrors}
      />

      {studentIdFilter && filterStudentName && (
        <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm shadow-sm">
          <span className="text-muted-foreground">
            当前筛选学员：{filterStudentName}
          </span>
          <Link
            href={buildAttendanceStatisticsHref({
              dateFrom: dateFromFilter,
              dateTo: dateToFilter,
              status: statusFilter,
            })}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            查看全部学员
          </Link>
        </div>
      )}

      {loadError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {!loadError && !summary && (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          暂无统计数据，请调整筛选条件后重试
        </p>
      )}

      {summary && <AttendanceStatisticsSummaryView summary={summary} />}
    </PageShell>
  )
}
