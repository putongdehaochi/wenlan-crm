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
  editingGroup?: StudentGroupSummary | null
  initialStudentIds?: string[]
  onSuccess: (group: StudentGroupSummary) => void
}

export function StudentGroupFormDialog({
  open,
  onOpenChange,
  students,
  editingGroup,
  initialStudentIds,
  onSuccess,
}: StudentGroupFormDialogProps) {
  const [name, setName] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
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
    setFieldErrors({})
  }, [open, editingGroup, initialStudentIds])

  async function handleSubmit() {
    setSubmitting(true)
    setFieldErrors({})

    const result = editingGroup
      ? await updateSavedStudentGroupAction({
          id: editingGroup.id,
          name,
          studentIds: selectedIds,
        })
      : await createSavedStudentGroupAction({
          name,
          studentIds: selectedIds,
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
