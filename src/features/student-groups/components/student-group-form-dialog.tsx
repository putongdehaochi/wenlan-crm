/**
 * @file student-group-form-dialog.tsx
 * @feature student-groups
 */

"use client"

import { useEffect, useState } from "react"

import {
  createSavedStudentGroupAction,
  updateSavedStudentGroupAction,
} from "@/features/student-groups/actions/student-group.actions"
import { StudentGroupMemberPicker } from "@/features/student-groups/components/student-group-member-picker"
import type { StudentGroupSummary } from "@/features/student-groups/types/student-group-summary.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { TeacherSelect } from "@/features/teachers/components/teacher-select"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { appToast } from "@/shared/lib/toast"

type StudentGroupFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  students: StudentSummary[]
  teachers: TeacherSummary[]
  editingGroup?: StudentGroupSummary | null
  initialStudentIds?: string[]
  initialTeacherId?: string | null
  onSuccess: (group: StudentGroupSummary) => void
}

export function StudentGroupFormDialog({
  open,
  onOpenChange,
  students,
  teachers,
  editingGroup,
  initialStudentIds,
  initialTeacherId,
  onSuccess,
}: StudentGroupFormDialogProps) {
  const [name, setName] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [teacherId, setTeacherId] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setName(editingGroup?.name ?? "")
    setSelectedIds(
      editingGroup?.studentIds ?? initialStudentIds ?? []
    )
    setTeacherId(editingGroup?.teacherId ?? initialTeacherId ?? "")
    setFieldErrors({})
  }, [open, editingGroup, initialStudentIds, initialTeacherId])

  async function handleSubmit() {
    setSubmitting(true)
    setFieldErrors({})

    const resolvedTeacherId = teacherId.trim() ? teacherId.trim() : null

    const result = editingGroup
      ? await updateSavedStudentGroupAction({
          id: editingGroup.id,
          name,
          studentIds: selectedIds,
          teacherId: resolvedTeacherId,
        })
      : await createSavedStudentGroupAction({
          name,
          studentIds: selectedIds,
          teacherId: resolvedTeacherId,
        })

    setSubmitting(false)

    if (result.success) {
      appToast.success(editingGroup ? "分组已更新" : "分组已创建")
      onSuccess(result.data)
      onOpenChange(false)
      return
    }

    if (result.errorType === "VALIDATION_ERROR") {
      setFieldErrors(result.fieldErrors ?? {})
      return
    }

    appToast.error(result.message ?? "保存失败")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingGroup ? "编辑分组" : "新建保存分组"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">分组名称</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：周六上午班"
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <TeacherSelect
            id="group-default-teacher"
            label="默认授课老师（可选）"
            teachers={teachers}
            value={teacherId}
            onChange={setTeacherId}
            includeSystemDefaultOption
            hint="签到时作为建议值，可在今日签到页覆盖"
          />

          <StudentGroupMemberPicker
            students={students}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            fieldError={fieldErrors.studentIds}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            取消
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "保存中…" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
