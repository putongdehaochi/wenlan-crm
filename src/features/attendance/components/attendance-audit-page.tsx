/**
 * @file attendance-audit-page.tsx
 * @feature attendance
 * @purpose 签到审计页容器；只读列表 + Timeline 侧栏
 */

"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { exportAttendanceAuditAction } from "@/features/attendance/actions/export-attendance-audit.action"
import { getAttendanceAuditTimelineAction } from "@/features/attendance/actions/get-attendance-audit-timeline.action"
import { AttendanceAuditFilter } from "@/features/attendance/components/attendance-audit-filter"
import { AttendanceAuditList } from "@/features/attendance/components/attendance-audit-list"
import { AttendanceAuditTimelinePanel } from "@/features/attendance/components/attendance-audit-timeline-panel"
import { AttendanceExportDownloadButton } from "@/features/attendance/components/attendance-export-download-button"
import {
  buildAttendanceAuditHref,
  buildListAttendanceAuditInput,
} from "@/features/attendance/lib/attendance-audit-query"
import type { AttendanceAuditListRow } from "@/features/attendance/types/attendance-audit-list-row.type"
import type { AttendanceAuditTimeline } from "@/features/attendance/types/attendance-audit-timeline.type"
import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"
import { PageShell } from "@/shared/components/page-shell"

type AttendanceAuditPageProps = {
  initialRows: AttendanceAuditListRow[]
  initialLoadError?: string
  initialFieldErrors?: Record<string, string>
  studentIdFilter?: string
  dateFromFilter?: string
  dateToFilter?: string
  statusFilter?: AttendanceStatus
  filterStudentName?: string
}

export function AttendanceAuditPage({
  initialRows,
  initialLoadError,
  initialFieldErrors,
  studentIdFilter,
  dateFromFilter,
  dateToFilter,
  statusFilter,
  filterStudentName,
}: AttendanceAuditPageProps) {
  const [rows, setRows] = useState(initialRows)
  const [listError, setListError] = useState(initialLoadError ?? null)
  const [filterFieldErrors, setFilterFieldErrors] = useState(
    initialFieldErrors ?? {}
  )

  const [timelineOpen, setTimelineOpen] = useState(false)
  const [timeline, setTimeline] = useState<AttendanceAuditTimeline | null>(
    null
  )
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState<string | null>(null)

  useEffect(() => {
    setRows(initialRows)
    setListError(initialLoadError ?? null)
    setFilterFieldErrors(initialFieldErrors ?? {})
  }, [
    initialRows,
    initialLoadError,
    initialFieldErrors,
    studentIdFilter,
    dateFromFilter,
    dateToFilter,
    statusFilter,
  ])

  async function handleRowClick(row: AttendanceAuditListRow) {
    setTimelineOpen(true)
    setTimeline(null)
    setTimelineError(null)
    setTimelineLoading(true)

    const result = await getAttendanceAuditTimelineAction({
      attendanceId: row.id,
    })

    setTimelineLoading(false)
    if (result.success) {
      setTimeline(result.data)
      return
    }

    setTimelineError(result.message ?? "加载 Timeline 失败")
  }

  function handleTimelineOpenChange(open: boolean) {
    setTimelineOpen(open)
    if (!open) {
      setTimeline(null)
      setTimelineError(null)
      setTimelineLoading(false)
    }
  }

  const descriptionParts = [
    "查看签到生命周期与状态变更记录（只读）",
    studentIdFilter && filterStudentName
      ? `筛选学员：${filterStudentName}`
      : null,
  ].filter(Boolean)

  return (
    <PageShell
      title="签到审计"
      description={descriptionParts.join(" · ")}
      actions={
        <AttendanceExportDownloadButton
          onExport={() =>
            exportAttendanceAuditAction(
              buildListAttendanceAuditInput({
                studentId: studentIdFilter,
                dateFrom: dateFromFilter,
                dateTo: dateToFilter,
                status: statusFilter,
              })
            )
          }
        />
      }
    >
      {studentIdFilter && (
        <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm shadow-sm">
          <span className="text-muted-foreground">当前按学员筛选</span>
          <Link
            href={buildAttendanceAuditHref({
              dateFrom: dateFromFilter,
              dateTo: dateToFilter,
              status: statusFilter,
            })}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            查看全部记录
          </Link>
        </div>
      )}

      <AttendanceAuditFilter
        studentIdFilter={studentIdFilter}
        dateFromFilter={dateFromFilter}
        dateToFilter={dateToFilter}
        statusFilter={statusFilter}
        fieldErrors={filterFieldErrors}
      />

      {listError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {listError}
        </p>
      )}

      <AttendanceAuditList rows={rows} onRowClick={handleRowClick} />

      <AttendanceAuditTimelinePanel
        open={timelineOpen}
        onOpenChange={handleTimelineOpenChange}
        timeline={timeline}
        loading={timelineLoading}
        error={timelineError}
      />
    </PageShell>
  )
}
