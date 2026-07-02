/**
 * @file void-attendance-dialog.tsx
 * @feature attendance
 * @purpose 撤销签到确认对话框；无 Action 调用，由父组件编排
 */

"use client"

import type { AttendanceHistoryRow } from "@/features/attendance/types/attendance-history-row.type"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

type VoidAttendanceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: AttendanceHistoryRow | null
  voiding: boolean
  error: string | null
  onConfirm: () => void
}

export function VoidAttendanceDialog({
  open,
  onOpenChange,
  row,
  voiding,
  error,
  onConfirm,
}: VoidAttendanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!voiding}>
        <DialogHeader>
          <DialogTitle>确认撤销签到</DialogTitle>
          <DialogDescription>
            {row
              ? `确定撤销 ${row.studentName} 在 ${row.attendanceDate} 的签到吗？撤销后课时余额将自动恢复。`
              : "确定撤销该签到记录吗？"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={voiding}
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={voiding || !row}
            onClick={onConfirm}
          >
            {voiding ? "撤销中…" : "确认撤销"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
