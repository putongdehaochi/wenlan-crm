/**
 * @file create-lesson-purchase-form.tsx
 * @feature lessons
 * @purpose 录入购课表单；仅调用 Action，不越层访问 Service/Repository
 */

"use client"

import { useState } from "react"

import { createLessonPurchaseAction } from "@/features/lessons/actions/create-lesson-purchase.action"
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

type CreateLessonPurchaseFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string | null
  onSuccess: () => void
}

const emptyForm = {
  quantity: "",
  note: "",
}

export function CreateLessonPurchaseForm({
  open,
  onOpenChange,
  studentId,
  onSuccess,
}: CreateLessonPurchaseFormProps) {
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
    if (!studentId) return

    setSubmitting(true)
    setFieldErrors({})
    setGlobalError(null)

    const quantity = Number(form.quantity)
    const result = await createLessonPurchaseAction({
      studentId,
      quantity,
      note: form.note || null,
    })

    setSubmitting(false)

    if (result.success) {
      resetForm()
      onOpenChange(false)
      onSuccess()
      appToast.success(`已录入 ${quantity} 课时`)
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
          <DialogTitle>录入课时</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="quantity">课时数 *</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              inputMode="numeric"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              aria-invalid={Boolean(fieldErrors.quantity)}
            />
            {fieldErrors.quantity && (
              <p className="text-sm text-destructive">{fieldErrors.quantity}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purchase-note">备注</Label>
            <Textarea
              id="purchase-note"
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
            <Button type="submit" disabled={submitting || !studentId}>
              {submitting ? "保存中…" : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
