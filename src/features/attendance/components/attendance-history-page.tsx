/**
 * @file attendance-history-page.tsx
 * @feature attendance
 * @purpose 签到历史页容器；编排 UI 状态与 Server Actions
 */

"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { listAttendanceHistoryAction } from "@/features/attendance/actions/list-attendance-history.action"
import { restoreAttendanceAction } from "@/features/attendance/actions/restore-attendance.action"
import { voidAttendanceAction } from "@/features/attendance/actions/void-attendance.action"
import { listTeachersAction } from "@/features/teachers/actions/teacher.actions"
import { AttendanceHistoryFilter } from "@/features/attendance/components/attendance-history-filter"
import { AttendanceHistoryList } from "@/features/attendance/components/attendance-history-list"
import { RestoreAttendanceDialog } from "@/features/attendance/components/restore-attendance-dialog"
import { VoidAttendanceDialog } from "@/features/attendance/components/void-attendance-dialog"
import {
  buildAttendanceHistoryHref,
  buildListAttendanceHistoryInput,
} from "@/features/attendance/lib/attendance-history-query"
import type { AttendanceHistoryRow } from "@/features/attendance/types/attendance-history-row.type"
import { getDefaultTeacherId } from "@/features/teachers/components/teacher-select"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import { PageShell } from "@/shared/components/page-shell"
import { appToast } from "@/shared/lib/toast"
import { useRefetchOnRouteEnter } from "@/shared/hooks/use-refetch-on-route-enter"

type AttendanceHistoryPageProps = {
  initialRows: AttendanceHistoryRow[]
  initialLoadError?: string
  initialFieldErrors?: Record<string, string>
  studentIdFilter?: string
  dateFromFilter?: string
  dateToFilter?: string
  filterStudentName?: string
  teachers: TeacherSummary[]
}

export function AttendanceHistoryPage({
  initialRows,
  initialLoadError,
  initialFieldErrors,
  studentIdFilter,
  dateFromFilter,
  dateToFilter,
  filterStudentName,
  teachers: initialTeachers,
}: AttendanceHistoryPageProps) {
  const [teachers, setTeachers] = useState(initialTeachers)
  const [rows, setRows] = useState(initialRows)
  const [listError, setListError] = useState(initialLoadError ?? null)
  const [filterFieldErrors, setFilterFieldErrors] = useState(
    initialFieldErrors ?? {}
  )

  const [voidTarget, setVoidTarget] = useState<AttendanceHistoryRow | null>(null)
  const [voidDialogOpen, setVoidDialogOpen] = useState(false)
  const [voiding, setVoiding] = useState(false)
  const [voidError, setVoidError] = useState<string | null>(null)

  const [restoreTarget, setRestoreTarget] =
    useState<AttendanceHistoryRow | null>(null)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [restoreTeacherId, setRestoreTeacherId] = useState(() =>
    getDefaultTeacherId(teachers)
  )

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
  ])

  const refreshList = useCallback(async () => {
    const result = await listAttendanceHistoryAction(
      buildListAttendanceHistoryInput({
        studentId: studentIdFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
      })
    )
    if (result.success) {
      setRows(result.data)
      setListError(null)
      setFilterFieldErrors({})
    } else if (result.errorType === "VALIDATION_ERROR" && result.fieldErrors) {
      setFilterFieldErrors(result.fieldErrors)
      setListError(null)
    } else {
      setListError(result.message ?? "加载签到历史失败")
      setFilterFieldErrors({})
    }
  }, [studentIdFilter, dateFromFilter, dateToFilter])

  const refreshPageData = useCallback(async () => {
    const [teachersResult] = await Promise.all([listTeachersAction()])
    if (teachersResult.success) {
      setTeachers(teachersResult.data)
    }
    await refreshList()
  }, [refreshList])

  useRefetchOnRouteEnter("/attendance/history", refreshPageData)

  function handleVoidClick(row: AttendanceHistoryRow) {
    setVoidTarget(row)
    setVoidError(null)
    setVoidDialogOpen(true)
  }

  function handleVoidDialogOpenChange(open: boolean) {
    if (voiding) return
    setVoidDialogOpen(open)
    if (!open) {
      setVoidTarget(null)
      setVoidError(null)
    }
  }

  async function handleVoidConfirm() {
    if (!voidTarget) return

    setVoiding(true)
    setVoidError(null)

    const result = await voidAttendanceAction({
      attendanceId: voidTarget.id,
    })

    if (result.success) {
      setVoidDialogOpen(false)
      setVoidTarget(null)
      setVoiding(false)
      await refreshList()
      appToast.success("签到已撤销", "课时余额已恢复")
      return
    }

    const message = result.message ?? "撤销失败，请稍后重试"
    setVoidError(message)
    appToast.error(message)
    setVoiding(false)
  }

  function handleRestoreClick(row: AttendanceHistoryRow) {
    setRestoreTarget(row)
    setRestoreTeacherId(row.teacherId ?? getDefaultTeacherId(teachers))
    setRestoreError(null)
    setRestoreDialogOpen(true)
  }

  function handleRestoreDialogOpenChange(open: boolean) {
    if (restoring) return
    setRestoreDialogOpen(open)
    if (!open) {
      setRestoreTarget(null)
      setRestoreError(null)
    }
  }

  async function handleRestoreConfirm() {
    if (!restoreTarget) return

    setRestoring(true)
    setRestoreError(null)

    const result = await restoreAttendanceAction({
      attendanceId: restoreTarget.id,
      teacherId: restoreTeacherId,
    })

    if (result.success) {
      setRestoreDialogOpen(false)
      setRestoreTarget(null)
      setRestoring(false)
      await refreshList()
      appToast.success("签到已恢复", "课时已重新扣减")
      return
    }

    const message = result.message ?? "恢复失败，请稍后重试"
    setRestoreError(message)
    appToast.error(message)
    setRestoring(false)
  }

  const description =
    studentIdFilter && filterStudentName
      ? `筛选学员：${filterStudentName}`
      : "查看与撤销、恢复签到记录"

  return (
    <PageShell title="签到历史" description={description}>
      {studentIdFilter && (
        <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm shadow-sm">
          <span className="text-muted-foreground">当前按学员筛选</span>
          <Link
            href={buildAttendanceHistoryHref({
              dateFrom: dateFromFilter,
              dateTo: dateToFilter,
            })}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            查看全部记录
          </Link>
        </div>
      )}

      <AttendanceHistoryFilter
        studentIdFilter={studentIdFilter}
        dateFromFilter={dateFromFilter}
        dateToFilter={dateToFilter}
        fieldErrors={filterFieldErrors}
      />

      {listError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {listError}
        </p>
      )}

      <AttendanceHistoryList
        rows={rows}
        onVoidClick={handleVoidClick}
        onRestoreClick={handleRestoreClick}
      />

      <VoidAttendanceDialog
        open={voidDialogOpen}
        onOpenChange={handleVoidDialogOpenChange}
        row={voidTarget}
        voiding={voiding}
        error={voidError}
        onConfirm={handleVoidConfirm}
      />

      <RestoreAttendanceDialog
        open={restoreDialogOpen}
        onOpenChange={handleRestoreDialogOpenChange}
        row={restoreTarget}
        teachers={teachers}
        teacherId={restoreTeacherId}
        onTeacherChange={setRestoreTeacherId}
        restoring={restoring}
        error={restoreError}
        onConfirm={handleRestoreConfirm}
      />
    </PageShell>
  )
}
