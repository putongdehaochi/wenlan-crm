/**
 * @file create-student-form.tsx
 * @feature students
 * @purpose 新增学生表单；通过 Action 提交，不越层访问 Service/Repository
 */

"use client"

import { useState } from "react"

import { createStudentAction } from "@/features/students/actions/create-student.action"
import { Button } from "@/shared/components/ui/button"
import { appToast } from "@/shared/lib/toast"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"

type CreateStudentFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const emptyForm = {
  name: "",
  contactName: "",
  phone: "",
  note: "",
}

export function CreateStudentForm({
  open,
  onOpenChange,
  onSuccess,
}: CreateStudentFormProps) {
  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setForm(emptyForm)
    setFieldErrors({})
    setGlobalError(null)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      resetForm()
    }
    onOpenChange(next)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setGlobalError(null)

    const result = await createStudentAction({
      name: form.name,
      contactName: form.contactName,
      phone: form.phone || null,
      note: form.note || null,
    })

    setSubmitting(false)

    if (result.success) {
      resetForm()
      onOpenChange(false)
      onSuccess()
      appToast.success(`已添加学员「${result.data.name}」`)
      return
    }

    if (result.errorType === "VALIDATION_ERROR" && result.fieldErrors) {
      setFieldErrors(result.fieldErrors)
      return
    }

    setGlobalError(result.message ?? "保存失败，请稍后重试")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新增学生</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactName">联系人 *</Label>
            <Input
              id="contactName"
              value={form.contactName}
              onChange={(e) =>
                setForm({ ...form, contactName: e.target.value })
              }
              aria-invalid={Boolean(fieldErrors.contactName)}
            />
            {fieldErrors.contactName && (
              <p className="text-sm text-destructive">
                {fieldErrors.contactName}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">电话</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              aria-invalid={Boolean(fieldErrors.phone)}
            />
            {fieldErrors.phone && (
              <p className="text-sm text-destructive">{fieldErrors.phone}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">备注</Label>
            <Textarea
              id="note"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              aria-invalid={Boolean(fieldErrors.note)}
            />
            {fieldErrors.note && (
              <p className="text-sm text-destructive">{fieldErrors.note}</p>
            )}
          </div>
          {globalError && (
            <p className="text-sm text-destructive">{globalError}</p>
          )}
          <DialogFooter className="mt-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中…" : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
