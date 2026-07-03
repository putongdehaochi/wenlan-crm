/**
 * @file teacher-form-dialog.tsx
 * @feature teachers
 */

"use client"

import { useEffect, useState } from "react"

import {
  createTeacherAction,
  updateTeacherAction,
} from "@/features/teachers/actions/teacher.actions"
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

type TeacherFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingTeacher?: TeacherSummary | null
  onSuccess: () => void | Promise<void>
}

export function TeacherFormDialog({
  open,
  onOpenChange,
  editingTeacher,
  onSuccess,
}: TeacherFormDialogProps) {
  const [name, setName] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setName(editingTeacher?.name ?? "")
    setFieldErrors({})
  }, [open, editingTeacher])

  async function handleSubmit() {
    setSubmitting(true)
    setFieldErrors({})

    const result = editingTeacher
      ? await updateTeacherAction({ id: editingTeacher.id, name })
      : await createTeacherAction({ name })

    setSubmitting(false)

    if (result.success) {
      appToast.success(editingTeacher ? "老师信息已更新" : "老师已添加")
      await onSuccess()
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTeacher ? "编辑老师" : "添加老师"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="teacher-name">姓名</Label>
          <Input
            id="teacher-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：王老师"
          />
          {fieldErrors.name && (
            <p className="text-sm text-destructive">{fieldErrors.name}</p>
          )}
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
