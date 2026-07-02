/**
 * @file lesson-records-filter.tsx
 * @feature lessons
 */

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition, type FormEvent } from "react"

import { buildLessonRecordsHref } from "@/features/lessons/lib/lesson-records-query"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import {
  matchStudents,
  resolveStudentIdFromQuery,
  StudentSearchSelect,
} from "@/shared/components/student-search-select"
import { Button } from "@/shared/components/ui/button"
import { Label } from "@/shared/components/ui/label"

type LessonRecordsFilterProps = {
  students: StudentSummary[]
  studentIdFilter?: string
  recordTypeFilter?: "purchase" | "adjustment"
}

const selectClassName =
  "flex h-9 min-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function LessonRecordsFilter({
  students,
  studentIdFilter,
  recordTypeFilter,
}: LessonRecordsFilterProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedStudentId, setSelectedStudentId] = useState(
    studentIdFilter ?? ""
  )
  const [studentQuery, setStudentQuery] = useState("")
  const [recordType, setRecordType] = useState(recordTypeFilter ?? "")
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    setSelectedStudentId(studentIdFilter ?? "")
    setRecordType(recordTypeFilter ?? "")
    setLocalError(null)
  }, [studentIdFilter, recordTypeFilter])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError(null)

    const trimmedQuery = studentQuery.trim()
    const resolvedStudentId = resolveStudentIdFromQuery(
      students,
      trimmedQuery,
      selectedStudentId || undefined
    )

    if (trimmedQuery && !resolvedStudentId) {
      const matchCount = matchStudents(students, trimmedQuery).length
      setLocalError(
        matchCount > 1
          ? "匹配到多位学员，请从列表中选择"
          : "未找到匹配学员，请从列表中选择"
      )
      return
    }

    const recordTypeValue =
      recordType === "purchase" || recordType === "adjustment"
        ? recordType
        : undefined

    startTransition(() => {
      router.push(
        buildLessonRecordsHref({
          studentId: resolvedStudentId,
          recordType: recordTypeValue,
        })
      )
      router.refresh()
    })
  }

  const hasFilters = studentIdFilter || recordTypeFilter

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 overflow-visible rounded-xl border border-border/80 bg-card px-4 py-4 shadow-sm"
    >
      <StudentSearchSelect
        id="lesson-records-student"
        students={students}
        value={selectedStudentId || undefined}
        fieldError={localError ?? undefined}
        className="min-w-[240px]"
        onChange={(studentId) => setSelectedStudentId(studentId ?? "")}
        onQueryChange={setStudentQuery}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="lesson-record-type">记录类型</Label>
        <select
          id="lesson-record-type"
          value={recordType}
          onChange={(event) => setRecordType(event.target.value)}
          className={selectClassName}
        >
          <option value="">全部</option>
          <option value="purchase">购课</option>
          <option value="adjustment">调整</option>
        </select>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "筛选中…" : "筛选"}
      </Button>

      {hasFilters && (
        <Link
          href={buildLessonRecordsHref()}
          className="pb-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          清除筛选
        </Link>
      )}
    </form>
  )
}
