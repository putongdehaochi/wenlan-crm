/**
 * @file attendance-page.tsx
 * @feature attendance
 * @purpose 今日签到页；支持分组模式与手动模式
 */

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { batchCheckInStudentsAction } from "@/features/attendance/actions/batch-check-in-students.action"
import { checkInStudentAction } from "@/features/attendance/actions/check-in-student.action"
import { listTodayAttendanceAction } from "@/features/attendance/actions/list-today-attendance.action"
import { restoreAttendanceAction } from "@/features/attendance/actions/restore-attendance.action"
import {
  AttendanceGroupToolbar,
  type GroupSelection,
} from "@/features/attendance/components/attendance-group-toolbar"
import { AttendanceManualPanel } from "@/features/attendance/components/attendance-manual-panel"
import { AttendanceTodayList } from "@/features/attendance/components/attendance-today-list"
import type { AttendanceTodayRow } from "@/features/attendance/types/attendance-today-row.type"
import type { ListTodayAttendanceInput } from "@/features/attendance/types/check-in-input.type"
import { StudentGroupFormDialog } from "@/features/student-groups/components/student-group-form-dialog"
import { StudentGroupMemberPicker } from "@/features/student-groups/components/student-group-member-picker"
import { updateSavedStudentGroupAction } from "@/features/student-groups/actions/student-group.actions"
import {
  filterTodayRowsBySearch,
  isSessionShowAll,
} from "@/features/attendance/lib/attendance-today-search"
import {
  createDefaultSessionStudentGroup,
  loadSessionStudentGroup,
  resetSessionStudentGroup,
  setSessionStudentIds,
} from "@/features/student-groups/lib/session-group.storage"
import type {
  SessionStudentGroup,
  StudentGroupSummary,
} from "@/features/student-groups/types/student-group-summary.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { appToast } from "@/shared/lib/toast"

type AttendanceMode = "group" | "manual"

type AttendancePageProps = {
  initialRows: AttendanceTodayRow[]
  initialLoadError?: string
  savedGroups: StudentGroupSummary[]
  students: StudentSummary[]
}

function formatTodayLabel(): string {
  return new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })
}

function buildListInput(
  mode: AttendanceMode,
  selection: GroupSelection
): ListTodayAttendanceInput {
  if (mode === "manual") {
    return {}
  }

  if (selection.kind === "saved") {
    return { groupId: selection.group.id }
  }

  if (selection.group.studentIds.length > 0) {
    return { studentIds: selection.group.studentIds }
  }

  return {}
}

export function AttendancePage({
  initialRows,
  initialLoadError,
  savedGroups: initialSavedGroups,
  students,
}: AttendancePageProps) {
  const [mode, setMode] = useState<AttendanceMode>("group")
  const [savedGroups, setSavedGroups] =
    useState<StudentGroupSummary[]>(initialSavedGroups)
  const [sessionGroup, setSessionGroup] = useState<SessionStudentGroup>(
    createDefaultSessionStudentGroup
  )
  const [selection, setSelection] = useState<GroupSelection>(() => ({
    kind: "session",
    group: createDefaultSessionStudentGroup(),
  }))
  const [sessionReady, setSessionReady] = useState(false)
  const [rows, setRows] = useState(initialRows)
  const [listError, setListError] = useState(initialLoadError ?? null)
  const [checkingInId, setCheckingInId] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [batchPending, setBatchPending] = useState(false)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [draftMemberIds, setDraftMemberIds] = useState<string[]>([])
  const [groupSearchQuery, setGroupSearchQuery] = useState("")

  const displayedRows = useMemo(() => {
    if (mode !== "group") {
      return rows
    }
    return filterTodayRowsBySearch(rows, students, groupSearchQuery)
  }, [mode, rows, students, groupSearchQuery])

  const checkInEligibleCount = useMemo(
    () => displayedRows.filter((row) => row.canCheckIn).length,
    [displayedRows]
  )

  const refreshList = useCallback(
    async (
      nextMode: AttendanceMode = mode,
      nextSelection: GroupSelection = selection
    ) => {
      const result = await listTodayAttendanceAction(
        buildListInput(nextMode, nextSelection)
      )

      if (result.success) {
        setRows(result.data)
        setListError(null)
      } else {
        setListError(result.message ?? "加载失败")
      }
    },
    [mode, selection]
  )

  useEffect(() => {
    const stored = loadSessionStudentGroup()
    setSessionGroup(stored)
    setSelection({ kind: "session", group: stored })
    setSessionReady(true)
  }, [])

  useEffect(() => {
    if (!sessionReady) {
      return
    }
    void refreshList(mode, selection)
  }, [mode, selection, refreshList, sessionReady])

  function clearRowError(studentId: string) {
    setRowErrors((prev) => {
      const next = { ...prev }
      delete next[studentId]
      return next
    })
  }

  async function handleCheckIn(studentId: string) {
    const studentName = rows.find((row) => row.id === studentId)?.name
    setCheckingInId(studentId)
    clearRowError(studentId)

    const result = await checkInStudentAction({
      studentId,
      groupId:
        mode === "group" && selection.kind === "saved"
          ? selection.group.id
          : undefined,
    })

    if (result.success) {
      await refreshList()
      setCheckingInId(null)
      appToast.success(
        studentName ? `${studentName} 签到成功` : "签到成功",
        "课时已自动扣减"
      )
      return
    }

    const message = result.message ?? "签到失败，请稍后重试"
    setRowErrors((prev) => ({ ...prev, [studentId]: message }))
    appToast.error(message)
    setCheckingInId(null)
  }

  async function handleRestore(attendanceId: string) {
    const row = rows.find((item) => item.attendanceId === attendanceId)
    if (!row) return

    setRestoringId(attendanceId)
    clearRowError(row.id)

    const result = await restoreAttendanceAction({ attendanceId })

    if (result.success) {
      await refreshList()
      setRestoringId(null)
      appToast.success(
        row.name ? `${row.name} 已恢复签到` : "已恢复签到",
        "课时已重新扣减"
      )
      return
    }

    const message = result.message ?? "恢复失败，请稍后重试"
    setRowErrors((prev) => ({ ...prev, [row.id]: message }))
    appToast.error(message)
    setRestoringId(null)
  }

  async function handleBatchCheckIn() {
    const targetIds = displayedRows
      .filter((row) => row.canCheckIn)
      .map((row) => row.id)
    if (targetIds.length === 0) {
      return
    }

    setBatchPending(true)
    const result = await batchCheckInStudentsAction({
      studentIds: targetIds,
      groupId:
        selection.kind === "saved" ? selection.group.id : undefined,
    })
    setBatchPending(false)

    if (!result.success) {
      appToast.error(result.message ?? "批量签到失败")
      return
    }

    await refreshList()

    const { succeeded, failed } = result.data
    if (succeeded.length > 0) {
      appToast.success(`已成功签到 ${succeeded.length} 人`)
    }
    if (failed.length > 0) {
      appToast.error(`${failed.length} 人签到失败`)
      setRowErrors((prev) => {
        const next = { ...prev }
        for (const item of failed) {
          next[item.studentId] = item.message
        }
        return next
      })
    }
  }

  function openMemberEditor() {
    if (selection.kind === "saved") {
      setDraftMemberIds([...selection.group.studentIds])
    } else if (isSessionShowAll(selection.group.studentIds)) {
      setDraftMemberIds(students.map((student) => student.id))
    } else {
      setDraftMemberIds([...selection.group.studentIds])
    }
    setMemberDialogOpen(true)
  }

  function handleResetSessionToAll() {
    const next = resetSessionStudentGroup()
    setSessionGroup(next)
    setSelection({ kind: "session", group: next })
    setGroupSearchQuery("")
  }

  function applyMemberChanges() {
    if (selection.kind === "saved") {
      void (async () => {
        const result = await updateSavedStudentGroupAction({
          id: selection.group.id,
          studentIds: draftMemberIds,
        })

        if (!result.success) {
          appToast.error(result.message ?? "更新分组失败")
          return
        }

        handleSavedGroupSuccess(result.data)
        setMemberDialogOpen(false)
        appToast.success("分组成员已更新")
      })()
      return
    }

    const next =
      draftMemberIds.length === 0 ||
      draftMemberIds.length === students.length
        ? resetSessionStudentGroup()
        : setSessionStudentIds(draftMemberIds)
    setSessionGroup(next)
    setSelection({ kind: "session", group: next })
    setMemberDialogOpen(false)
  }

  function handleSavedGroupSuccess(group: StudentGroupSummary) {
    setSavedGroups((prev) => {
      const exists = prev.some((item) => item.id === group.id)
      if (exists) {
        return prev.map((item) => (item.id === group.id ? group : item))
      }
      return [group, ...prev]
    })
    setSelection({ kind: "saved", group })
  }

  return (
    <PageShell title="今日签到" description={formatTodayLabel()} descriptionSuppressHydrationWarning>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "group" ? "default" : "outline"}
          onClick={() => setMode("group")}
        >
          分组模式
        </Button>
        <Button
          type="button"
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => setMode("manual")}
        >
          手动模式
        </Button>
      </div>

      {mode === "group" ? (
        <AttendanceGroupToolbar
          sessionGroup={sessionGroup}
          savedGroups={savedGroups}
          totalActiveStudents={students.length}
          selection={selection}
          searchQuery={groupSearchQuery}
          onSearchQueryChange={setGroupSearchQuery}
          onSelectionChange={(nextSelection) => {
            setGroupSearchQuery("")
            if (nextSelection.kind === "session") {
              setSelection({ kind: "session", group: sessionGroup })
              return
            }
            setSelection(nextSelection)
          }}
          onEditMembers={openMemberEditor}
          onResetSessionToAll={handleResetSessionToAll}
          onSaveGroup={() => setSaveDialogOpen(true)}
          onBatchCheckIn={handleBatchCheckIn}
          batchPending={batchPending}
          rosterCount={rows.length}
          checkInEligibleCount={checkInEligibleCount}
          filteredCount={displayedRows.length}
        />
      ) : (
        <AttendanceManualPanel
          students={students}
          rows={rows}
          checkingInId={checkingInId}
          onCheckIn={handleCheckIn}
        />
      )}

      {listError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {listError}
        </p>
      )}

      <AttendanceTodayList
        rows={mode === "group" ? displayedRows : rows}
        checkingInId={checkingInId}
        restoringId={restoringId}
        rowErrors={rowErrors}
        onCheckIn={handleCheckIn}
        onRestore={handleRestore}
        emptyMessage={
          mode === "group"
            ? groupSearchQuery.trim()
              ? "没有匹配的学员，请调整搜索关键词"
              : rows.length === 0
                ? "暂无在读学员，请先在「学生管理」中登记"
                : undefined
            : undefined
        }
      />

      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑分组成员</DialogTitle>
          </DialogHeader>
          <StudentGroupMemberPicker
            students={students}
            selectedIds={draftMemberIds}
            onChange={setDraftMemberIds}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMemberDialogOpen(false)}
            >
              取消
            </Button>
            <Button type="button" onClick={applyMemberChanges}>
              应用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StudentGroupFormDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        students={students}
        initialStudentIds={
          selection.kind === "session" && isSessionShowAll(selection.group.studentIds)
            ? students.map((student) => student.id)
            : selection.group.studentIds
        }
        onSuccess={handleSavedGroupSuccess}
      />
    </PageShell>
  )
}
