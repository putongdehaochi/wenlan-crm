/**
 * @file lesson-records-page.tsx
 * @feature lessons
 */

"use client"

import { useCallback, useState } from "react"

import { LessonRecordsFilter } from "@/features/lessons/components/lesson-records-filter"
import { LessonRecordsList } from "@/features/lessons/components/lesson-records-list"
import type { LessonRecordListRow } from "@/features/lessons/types/lesson-record-list-row.type"
import { listStudentsAction } from "@/features/students/actions/list-students.action"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { useRefetchOnRouteEnter } from "@/shared/hooks/use-refetch-on-route-enter"
import { PageShell } from "@/shared/components/page-shell"

type LessonRecordsPageProps = {
  students: StudentSummary[]
  rows: LessonRecordListRow[]
  loadError?: string
  studentIdFilter?: string
  recordTypeFilter?: "purchase" | "adjustment"
  filterStudentName?: string
}

export function LessonRecordsPage({
  students: initialStudents,
  rows,
  loadError,
  studentIdFilter,
  recordTypeFilter,
  filterStudentName,
}: LessonRecordsPageProps) {
  const [students, setStudents] = useState(initialStudents)

  const refreshStudents = useCallback(async () => {
    const result = await listStudentsAction()
    if (result.success) {
      setStudents(result.data)
    }
  }, [])

  useRefetchOnRouteEnter("/students/lesson-records", refreshStudents)

  return (
    <PageShell
      title="课时记录"
      description="工作室全部购课与课时调整记录"
    >
      <LessonRecordsFilter
        students={students}
        studentIdFilter={studentIdFilter}
        recordTypeFilter={recordTypeFilter}
      />

      {studentIdFilter && filterStudentName && (
        <p className="text-sm text-muted-foreground">
          当前筛选学员：{filterStudentName}
        </p>
      )}

      {loadError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {!loadError && <LessonRecordsList rows={rows} />}
    </PageShell>
  )
}
