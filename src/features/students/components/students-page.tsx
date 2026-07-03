/**
 * @file students-page.tsx
 * @feature students
 * @purpose 学生管理页容器；编排 UI 状态与 Server Actions
 */

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { AdjustLessonBalanceForm } from "@/features/lessons/components/adjust-lesson-balance-form"
import { CreateLessonPurchaseForm } from "@/features/lessons/components/create-lesson-purchase-form"
import { listStudentLessonRecordsAction } from "@/features/lessons/actions/list-student-lesson-records.action"
import type { StudentLessonRecords } from "@/features/lessons/types/lesson-record-row.type"
import { getStudentAction } from "@/features/students/actions/get-student.action"
import { listStudentsAction } from "@/features/students/actions/list-students.action"
import { CreateStudentForm } from "@/features/students/components/create-student-form"
import { StudentDetailView } from "@/features/students/components/student-detail-view"
import { StudentList } from "@/features/students/components/student-list"
import { StudentListToolbar } from "@/features/students/components/student-list-toolbar"
import {
  matchStudentSummaries,
  sortStudentSummaries,
  type StudentSortKey,
} from "@/features/students/lib/student-search"
import type { StudentDetail } from "@/features/students/types/student-detail.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"

type StudentsPageProps = {
  initialSummaries: StudentSummary[]
  initialLoadError?: string
}

export function StudentsPage({
  initialSummaries,
  initialLoadError,
}: StudentsPageProps) {
  const [summaries, setSummaries] = useState(initialSummaries)
  const [listError, setListError] = useState(initialLoadError ?? null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false)
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  )
  const [detail, setDetail] = useState<StudentDetail | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [lessonRecords, setLessonRecords] = useState<StudentLessonRecords | null>(
    null
  )
  const [lessonRecordsLoading, setLessonRecordsLoading] = useState(false)
  const [lessonRecordsError, setLessonRecordsError] = useState<string | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<StudentSortKey>("name-asc")

  const displayedSummaries = useMemo(() => {
    const filtered = matchStudentSummaries(summaries, searchQuery)
    return sortStudentSummaries(filtered, sortKey)
  }, [summaries, searchQuery, sortKey])

  const refreshList = useCallback(async () => {
    const result = await listStudentsAction()
    if (result.success) {
      setSummaries(result.data)
      setListError(null)
    } else {
      setListError(result.message ?? "加载失败")
    }
  }, [])

  useEffect(() => {
    void refreshList()
  }, [refreshList])

  const refreshDetail = useCallback(async (studentId: string) => {
    const result = await getStudentAction(studentId)
    if (result.success) {
      setDetail(result.data)
      setDetailError(null)
      return
    }
    setDetail(null)
    setDetailError(result.message ?? "加载失败")
  }, [])

  const refreshLessonRecords = useCallback(async (studentId: string) => {
    setLessonRecordsLoading(true)
    setLessonRecordsError(null)

    const result = await listStudentLessonRecordsAction(studentId)
    setLessonRecordsLoading(false)

    if (result.success) {
      setLessonRecords(result.data)
      return
    }

    setLessonRecords(null)
    setLessonRecordsError(result.message ?? "课时记录加载失败")
  }, [])

  useEffect(() => {
    if (!selectedStudentId) {
      setDetail(null)
      setDetailError(null)
      setIsDetailLoading(false)
      setLessonRecords(null)
      setLessonRecordsError(null)
      setLessonRecordsLoading(false)
      return
    }

    let cancelled = false
    setIsDetailLoading(true)
    setDetailError(null)
    setLessonRecordsLoading(true)
    setLessonRecordsError(null)

    Promise.all([
      getStudentAction(selectedStudentId),
      listStudentLessonRecordsAction(selectedStudentId),
    ]).then(([detailResult, recordsResult]) => {
      if (cancelled) return

      setIsDetailLoading(false)
      setLessonRecordsLoading(false)

      if (detailResult.success) {
        setDetail(detailResult.data)
      } else {
        setDetail(null)
        setDetailError(
          detailResult.errorType === "VALIDATION_ERROR"
            ? "无效的学员 ID"
            : (detailResult.message ?? "加载失败")
        )
      }

      if (recordsResult.success) {
        setLessonRecords(recordsResult.data)
      } else {
        setLessonRecords(null)
        setLessonRecordsError(recordsResult.message ?? "课时记录加载失败")
      }
    })

    return () => {
      cancelled = true
    }
  }, [selectedStudentId])

  function handleOpenCreate() {
    setSelectedStudentId(null)
    setIsPurchaseOpen(false)
    setIsAdjustOpen(false)
    setIsCreateOpen(true)
  }

  function handleSelectStudent(id: string) {
    setIsCreateOpen(false)
    setIsPurchaseOpen(false)
    setIsAdjustOpen(false)
    setSelectedStudentId(id)
  }

  function handleOpenPurchase() {
    setIsCreateOpen(false)
    setIsAdjustOpen(false)
    setIsPurchaseOpen(true)
  }

  function handleOpenAdjust() {
    setIsCreateOpen(false)
    setIsPurchaseOpen(false)
    setIsAdjustOpen(true)
  }

  async function handleLessonMutationSuccess() {
    await refreshList()
    if (selectedStudentId) {
      await Promise.all([
        refreshDetail(selectedStudentId),
        refreshLessonRecords(selectedStudentId),
      ])
    }
  }

  return (
    <PageShell
      title="学生管理"
      description="登记学员、录入与调整课时、查看变动记录"
      actions={
        <Button type="button" onClick={handleOpenCreate}>
          新增学生
        </Button>
      }
    >
      {listError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {listError}
        </p>
      )}

      <StudentListToolbar
        searchQuery={searchQuery}
        sortKey={sortKey}
        resultCount={displayedSummaries.length}
        totalCount={summaries.length}
        onSearchChange={setSearchQuery}
        onSortChange={setSortKey}
      />

      <StudentList
        summaries={displayedSummaries}
        onSelect={handleSelectStudent}
        onCreateClick={handleOpenCreate}
        hasSearchQuery={Boolean(searchQuery.trim())}
      />

      <CreateStudentForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refreshList}
      />

      <CreateLessonPurchaseForm
        open={isPurchaseOpen}
        onOpenChange={setIsPurchaseOpen}
        studentId={selectedStudentId}
        onSuccess={handleLessonMutationSuccess}
      />

      <AdjustLessonBalanceForm
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        studentId={selectedStudentId}
        currentBalance={detail?.lessonBalance}
        onSuccess={handleLessonMutationSuccess}
      />

      <StudentDetailView
        open={selectedStudentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStudentId(null)
            setIsPurchaseOpen(false)
            setIsAdjustOpen(false)
          }
        }}
        detail={detail}
        loading={isDetailLoading}
        error={detailError}
        lessonRecords={lessonRecords}
        lessonRecordsLoading={lessonRecordsLoading}
        lessonRecordsError={lessonRecordsError}
        onPurchaseClick={handleOpenPurchase}
        onAdjustClick={handleOpenAdjust}
      />
    </PageShell>
  )
}
