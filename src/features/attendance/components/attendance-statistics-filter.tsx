/**
 * @file attendance-statistics-filter.tsx
 * @feature attendance
 * @purpose 统计筛选；URL Query 驱动（学员 + 日期 + 状态）
 */

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition, type FormEvent } from "react"

import { buildAttendanceStatisticsHref } from "@/features/attendance/lib/attendance-statistics-query"
import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import {
  matchStudents,
  resolveStudentIdFromQuery,
  StudentSearchSelect,
} from "@/shared/components/student-search-select"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

type AttendanceStatisticsFilterProps = {
  students: StudentSummary[]
  studentIdFilter?: string
  dateFromFilter?: string
  dateToFilter?: string
  statusFilter?: AttendanceStatus
  fieldErrors?: Record<string, string>
}

const selectClassName =
  "flex h-9 min-w-[140px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function AttendanceStatisticsFilter({
  students,
  studentIdFilter,
  dateFromFilter,
  dateToFilter,
  statusFilter,
  fieldErrors,
}: AttendanceStatisticsFilterProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedStudentId, setSelectedStudentId] = useState(
    studentIdFilter ?? ""
  )
  const [studentQuery, setStudentQuery] = useState("")
  const [dateFrom, setDateFrom] = useState(dateFromFilter ?? "")
  const [dateTo, setDateTo] = useState(dateToFilter ?? "")
  const [status, setStatus] = useState(statusFilter ?? "")
  const [localFieldErrors, setLocalFieldErrors] = useState<
    Record<string, string>
  >({})

  useEffect(() => {
    setSelectedStudentId(studentIdFilter ?? "")
    setDateFrom(dateFromFilter ?? "")
    setDateTo(dateToFilter ?? "")
    setStatus(statusFilter ?? "")
    setLocalFieldErrors({})
  }, [studentIdFilter, dateFromFilter, dateToFilter, statusFilter])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalFieldErrors({})

    const statusValue =
      status === "VALID" || status === "VOIDED" ? status : undefined

    const trimmedQuery = studentQuery.trim()
    const resolvedStudentId = resolveStudentIdFromQuery(
      students,
      trimmedQuery,
      selectedStudentId || undefined
    )

    if (trimmedQuery && !resolvedStudentId) {
      const matchCount = matchStudents(students, trimmedQuery).length
      setLocalFieldErrors({
        studentId:
          matchCount > 1
            ? "匹配到多位学员，请从列表中选择"
            : "未找到匹配学员，请从列表中选择或清空搜索",
      })
      return
    }

    const href = buildAttendanceStatisticsHref({
      studentId: resolvedStudentId,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      status: statusValue,
    })

    startTransition(() => {
      router.push(href)
      router.refresh()
    })
  }

  const mergedFieldErrors = {
    ...fieldErrors,
    ...localFieldErrors,
  }

  const hasFilters =
    studentIdFilter || dateFromFilter || dateToFilter || statusFilter

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 overflow-visible rounded-xl border border-border/80 bg-card px-4 py-4 shadow-sm"
    >
      <StudentSearchSelect
        id="stats-studentId"
        students={students}
        value={selectedStudentId || undefined}
        fieldError={mergedFieldErrors.studentId}
        className="min-w-[240px]"
        onChange={(studentId) => setSelectedStudentId(studentId ?? "")}
        onQueryChange={setStudentQuery}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="stats-dateFrom">开始日期</Label>
        <Input
          id="stats-dateFrom"
          name="dateFrom"
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          aria-invalid={Boolean(mergedFieldErrors.dateFrom)}
        />
        {mergedFieldErrors.dateFrom && (
          <p className="text-sm text-destructive">
            {mergedFieldErrors.dateFrom}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="stats-dateTo">结束日期</Label>
        <Input
          id="stats-dateTo"
          name="dateTo"
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          aria-invalid={Boolean(mergedFieldErrors.dateTo)}
        />
        {mergedFieldErrors.dateTo && (
          <p className="text-sm text-destructive">{mergedFieldErrors.dateTo}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="stats-status">签到状态</Label>
        <select
          id="stats-status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={`${selectClassName} w-[120px]`}
          aria-invalid={Boolean(mergedFieldErrors.status)}
        >
          <option value="">全部</option>
          <option value="VALID">有效</option>
          <option value="VOIDED">已撤销</option>
        </select>
        {mergedFieldErrors.status && (
          <p className="text-sm text-destructive">{mergedFieldErrors.status}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "筛选中…" : "筛选"}
      </Button>

      {hasFilters && (
        <Link
          href={buildAttendanceStatisticsHref()}
          className="pb-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => {
            startTransition(() => {
              router.refresh()
            })
          }}
        >
          清除筛选
        </Link>
      )}
    </form>
  )
}
