/**
 * @file student-groups-page.tsx
 * @feature student-groups
 */

"use client"

import { useCallback, useMemo, useState } from "react"

import {
  deleteSavedStudentGroupAction,
  listSavedStudentGroupsAction,
} from "@/features/student-groups/actions/student-group.actions"
import { StudentGroupFormDialog } from "@/features/student-groups/components/student-group-form-dialog"
import {
  filterStudentGroups,
  formatGroupMemberPreview,
  formatGroupTeacherLabel,
} from "@/features/student-groups/lib/student-group-search"
import type { StudentGroupSummary } from "@/features/student-groups/types/student-group-summary.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { appToast } from "@/shared/lib/toast"

type StudentGroupsPageProps = {
  initialGroups: StudentGroupSummary[]
  students: StudentSummary[]
  teachers: TeacherSummary[]
  initialLoadError?: string
}

export function StudentGroupsPage({
  initialGroups,
  students,
  teachers,
  initialLoadError,
}: StudentGroupsPageProps) {
  const [groups, setGroups] = useState(initialGroups)
  const [loadError, setLoadError] = useState(initialLoadError ?? null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<StudentGroupSummary | null>(
    null
  )

  const displayedGroups = useMemo(
    () => filterStudentGroups(groups, students, teachers, searchQuery),
    [groups, students, teachers, searchQuery]
  )

  const refreshGroups = useCallback(async () => {
    const result = await listSavedStudentGroupsAction()
    if (result.success) {
      setGroups(result.data)
      setLoadError(null)
    } else {
      setLoadError(result.message ?? "加载失败")
    }
  }, [])

  function openCreateDialog() {
    setEditingGroup(null)
    setDialogOpen(true)
  }

  function openEditDialog(group: StudentGroupSummary) {
    setEditingGroup(group)
    setDialogOpen(true)
  }

  async function handleDelete(group: StudentGroupSummary) {
    if (!window.confirm(`确定删除分组「${group.name}」吗？`)) {
      return
    }

    const result = await deleteSavedStudentGroupAction(group.id)
    if (result.success) {
      appToast.success("分组已删除")
      await refreshGroups()
      return
    }

    appToast.error(result.message ?? "删除失败")
  }

  return (
    <PageShell
      title="学员分组"
      description="保存常用签到名单，在今日签到中快速筛选"
      actions={
        <Button type="button" onClick={openCreateDialog}>
          新建分组
        </Button>
      }
    >
      {loadError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {groups.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border/80 bg-card px-4 py-4 shadow-sm">
          <Label htmlFor="student-group-search">搜索分组</Label>
          <Input
            id="student-group-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="分组名称、默认老师，或成员姓名、联系人、电话…"
          />
          {searchQuery.trim() && (
            <p className="text-sm text-muted-foreground">
              共 {displayedGroups.length}/{groups.length} 个分组
            </p>
          )}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          暂无保存的分组。可在今日签到页创建临时分组后保存，或在此新建。
        </div>
      ) : displayedGroups.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          没有匹配的分组，请调整搜索关键词。
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>默认老师</TableHead>
                <TableHead>成员</TableHead>
                <TableHead>成员数</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatGroupTeacherLabel(group, teachers)}
                  </TableCell>
                  <TableCell className="max-w-xs text-muted-foreground">
                    {formatGroupMemberPreview(group, students)}
                  </TableCell>
                  <TableCell>{group.memberCount}</TableCell>
                  <TableCell>
                    {new Date(group.createdAt).toLocaleDateString("zh-CN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(group)}
                      >
                        编辑
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(group)}
                      >
                        删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <StudentGroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        students={students}
        teachers={teachers}
        editingGroup={editingGroup}
        onSuccess={async () => {
          await refreshGroups()
        }}
      />
    </PageShell>
  )
}
