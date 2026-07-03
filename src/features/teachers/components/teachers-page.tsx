/**
 * @file teachers-page.tsx
 * @feature teachers
 */

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  deleteTeacherAction,
  listTeachersAction,
  setDefaultTeacherAction,
} from "@/features/teachers/actions/teacher.actions"
import { TeacherFormDialog } from "@/features/teachers/components/teacher-form-dialog"
import { filterTeachersBySearch } from "@/features/teachers/lib/teacher-search"
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

type TeachersPageProps = {
  initialTeachers: TeacherSummary[]
  initialLoadError?: string
}

export function TeachersPage({
  initialTeachers,
  initialLoadError,
}: TeachersPageProps) {
  const [teachers, setTeachers] = useState(initialTeachers)
  const [loadError, setLoadError] = useState(initialLoadError ?? null)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<TeacherSummary | null>(
    null
  )
  const [pendingId, setPendingId] = useState<string | null>(null)

  const displayedTeachers = useMemo(
    () => filterTeachersBySearch(teachers, searchQuery),
    [teachers, searchQuery]
  )

  const refreshTeachers = useCallback(async () => {
    const result = await listTeachersAction()
    if (result.success) {
      setTeachers(result.data)
      setLoadError(null)
    } else {
      setLoadError(result.message ?? "加载失败")
    }
  }, [])

  useEffect(() => {
    void refreshTeachers()
  }, [refreshTeachers])

  function openCreateDialog() {
    setEditingTeacher(null)
    setDialogOpen(true)
  }

  function openEditDialog(teacher: TeacherSummary) {
    setEditingTeacher(teacher)
    setDialogOpen(true)
  }

  async function handleSetDefault(teacher: TeacherSummary) {
    if (teacher.isDefault) {
      return
    }

    setPendingId(teacher.id)
    const result = await setDefaultTeacherAction(teacher.id)
    setPendingId(null)

    if (result.success) {
      appToast.success(`已将「${teacher.name}」设为默认老师`)
      await refreshTeachers()
      return
    }

    appToast.error(result.message ?? "设置失败")
  }

  async function handleDelete(teacher: TeacherSummary) {
    if (!window.confirm(`确定删除老师「${teacher.name}」吗？`)) {
      return
    }

    setPendingId(teacher.id)
    const result = await deleteTeacherAction(teacher.id)
    setPendingId(null)

    if (result.success) {
      appToast.success("老师已删除")
      await refreshTeachers()
      return
    }

    appToast.error(result.message ?? "删除失败")
  }

  return (
    <PageShell
      title="老师管理"
      description="维护授课老师名单；默认老师会在签到时自动填充"
      actions={
        <Button type="button" onClick={openCreateDialog}>
          添加老师
        </Button>
      }
    >
      {loadError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {teachers.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border/80 bg-card px-4 py-4 shadow-sm">
          <Label htmlFor="teacher-search">搜索老师</Label>
          <Input
            id="teacher-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="按姓名搜索…"
          />
          {searchQuery.trim() && (
            <p className="text-sm text-muted-foreground">
              共 {displayedTeachers.length}/{teachers.length} 位老师
            </p>
          )}
        </div>
      )}

      {teachers.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          暂无老师记录。系统会在首次签到时创建默认老师，也可在此手动添加。
        </div>
      ) : displayedTeachers.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          没有匹配的老师，请调整搜索关键词。
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>默认</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>
                    {teacher.isDefault ? (
                      <span className="text-sm text-primary">系统默认</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(teacher.createdAt).toLocaleDateString("zh-CN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!teacher.isDefault && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={pendingId === teacher.id}
                          onClick={() => handleSetDefault(teacher)}
                        >
                          设为默认
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(teacher)}
                      >
                        编辑
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          teacher.isDefault || pendingId === teacher.id
                        }
                        onClick={() => handleDelete(teacher)}
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

      <TeacherFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTeacher={editingTeacher}
        onSuccess={refreshTeachers}
      />
    </PageShell>
  )
}
