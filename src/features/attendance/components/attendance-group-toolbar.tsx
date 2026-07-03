/**
 * @file attendance-group-toolbar.tsx
 * @feature attendance
 */

"use client"

import Link from "next/link"
import { UsersRound } from "lucide-react"

import {
  describeSessionGroup,
  isSessionShowAll,
} from "@/features/attendance/lib/attendance-today-search"
import type {
  SessionStudentGroup,
  StudentGroupSummary,
} from "@/features/student-groups/types/student-group-summary.type"
import { TeacherSelect } from "@/features/teachers/components/teacher-select"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

export type GroupSelection =
  | { kind: "session"; group: SessionStudentGroup }
  | { kind: "saved"; group: StudentGroupSummary }

type AttendanceGroupToolbarProps = {
  sessionGroup: SessionStudentGroup
  savedGroups: StudentGroupSummary[]
  totalActiveStudents: number
  selection: GroupSelection
  teachers: TeacherSummary[]
  selectedTeacherId: string
  onTeacherChange: (teacherId: string) => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onSelectionChange: (selection: GroupSelection) => void
  onEditMembers: () => void
  onResetSessionToAll: () => void
  onSaveGroup: () => void
  onBatchCheckIn: () => void
  batchPending: boolean
  rosterCount: number
  checkInEligibleCount: number
  filteredCount: number
}

export function AttendanceGroupToolbar({
  sessionGroup,
  savedGroups,
  totalActiveStudents,
  selection,
  teachers,
  selectedTeacherId,
  onTeacherChange,
  searchQuery,
  onSearchQueryChange,
  onSelectionChange,
  onEditMembers,
  onResetSessionToAll,
  onSaveGroup,
  onBatchCheckIn,
  batchPending,
  rosterCount,
  checkInEligibleCount,
  filteredCount,
}: AttendanceGroupToolbarProps) {
  const rosterLabel =
    selection.kind === "session"
      ? describeSessionGroup(selection.group.studentIds, totalActiveStudents)
      : `${selection.group.name}（${selection.group.memberCount} 人）`

  const showResetSession =
    selection.kind === "session" &&
    !isSessionShowAll(selection.group.studentIds)

  const selectValue =
    selection.kind === "session"
      ? "session:current"
      : `saved:${selection.group.id}`

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[220px] flex-1 space-y-2">
          <Label htmlFor="attendance-group-select">签到分组</Label>
          <select
            id="attendance-group-select"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={selectValue}
            onChange={(event) => {
              const value = event.target.value
              if (value === "session:current") {
                onSelectionChange({ kind: "session", group: sessionGroup })
                return
              }

              const groupId = value.replace("saved:", "")
              const group = savedGroups.find((item) => item.id === groupId)
              if (group) {
                onSelectionChange({ kind: "saved", group })
              }
            }}
          >
            <option value="session:current">
              {`${sessionGroup.name}（${describeSessionGroup(sessionGroup.studentIds, totalActiveStudents)}）`}
            </option>
            {savedGroups.map((group) => (
              <option key={group.id} value={`saved:${group.id}`}>
                {group.name}（{group.memberCount} 人）
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onEditMembers}>
            编辑成员
          </Button>
          {showResetSession && (
            <Button type="button" variant="outline" onClick={onResetSessionToAll}>
              显示全部
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onSaveGroup}>
            保存分组
          </Button>
          <Link
            href="/students/groups"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted/60"
          >
            <UsersRound className="size-4" />
            管理分组
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)]">
        <TeacherSelect
          id="attendance-group-teacher"
          teachers={teachers}
          value={selectedTeacherId}
          onChange={onTeacherChange}
          hint="可覆盖分组默认老师；未选分组默认时使用系统默认老师"
        />
        <div className="space-y-2">
          <Label htmlFor="attendance-group-search">搜索学员</Label>
          <Input
            id="attendance-group-search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="搜索姓名、联系人或电话…"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <p className="text-sm text-muted-foreground">
          当前范围：{rosterLabel}
          {searchQuery.trim()
            ? ` · 搜索命中 ${filteredCount}/${rosterCount} 人`
            : ` · 共 ${rosterCount} 人`}
          {checkInEligibleCount > 0
            ? ` · 可批量签到 ${checkInEligibleCount} 人`
            : " · 暂无可签到学员"}
        </p>
        <Button
          type="button"
          onClick={onBatchCheckIn}
          disabled={batchPending || checkInEligibleCount === 0}
        >
          {batchPending ? "批量签到中…" : "批量签到"}
        </Button>
      </div>
    </div>
  )
}
