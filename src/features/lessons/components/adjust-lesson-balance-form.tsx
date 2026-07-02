/**
 * @file adjust-lesson-balance-form.tsx
 * @feature lessons
 * @purpose 课时调整表单（可增可减）
 */

"use client"

import { useState } from "react"

import { adjustLessonBalanceAction } from "@/features/lessons/actions/adjust-lesson-balance.action"
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

type AdjustLessonBalanceFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string | null
  currentBalance?: number
  onSuccess: () => void
}

const emptyForm = {
  quantityDelta: "",
  note: "",
}

export function AdjustLessonBalanceForm({
  open,
  onOpenChange,
  studentId,
  currentBalance,
  onSuccess,
}: AdjustLessonBalanceFormProps) {
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

    const quantityDelta = Number(form.quantityDelta)
    const result = await adjustLessonBalanceAction({
      studentId,
      quantityDelta,
      note: form.note,
    })

    setSubmitting(false)

    if (result.success) {
      resetForm()
      onOpenChange(false)
      onSuccess()
      appToast.success(
        quantityDelta > 0
          ? `已增加 ${quantityDelta} 课时`
          : `已扣减 ${Math.abs(quantityDelta)} 课时`
      )
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
          <DialogTitle>课时调整</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {currentBalance != null && (
            <p className="text-sm text-muted-foreground">
              当前余额：{currentBalance} 课时
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="quantityDelta">调整课时数 *</Label>
            <Input
              id="quantityDelta"
              type="number"
              inputMode="numeric"
              placeholder="正数增加，负数扣减，如 -2"
              value={form.quantityDelta}
              onChange={(e) =>
                setForm({ ...form, quantityDelta: e.target.value })
              }
              aria-invalid={Boolean(fieldErrors.quantityDelta)}
            />
            {fieldErrors.quantityDelta && (
              <p className="text-sm text-destructive">
                {fieldErrors.quantityDelta}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adjust-note">调整原因 *</Label>
            <Textarea
              id="adjust-note"
              placeholder="请说明调整原因，便于日后核对"
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
              {submitting ? "保存中…" : "确认调整"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
