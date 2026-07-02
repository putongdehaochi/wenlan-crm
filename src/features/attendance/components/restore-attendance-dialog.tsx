/**
 * @file restore-attendance-dialog.tsx
 * @feature attendance
 * @purpose 恢复签到确认对话框；无 Action 调用，由父组件编排
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

type RestoreAttendanceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: AttendanceHistoryRow | null
  restoring: boolean
  error: string | null
  onConfirm: () => void
}

export function RestoreAttendanceDialog({
  open,
  onOpenChange,
  row,
  restoring,
  error,
  onConfirm,
}: RestoreAttendanceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!restoring}>
        <DialogHeader>
          <DialogTitle>确认恢复签到</DialogTitle>
          <DialogDescription>
            {row
              ? `确定恢复 ${row.studentName} 在 ${row.attendanceDate} 的签到吗？恢复后将重新消耗 1 课时。`
              : "确定恢复该签到记录吗？"}
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
            disabled={restoring}
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type="button"
            disabled={restoring || !row}
            onClick={onConfirm}
          >
            {restoring ? "恢复中…" : "确认恢复"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
