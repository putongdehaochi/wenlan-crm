/**
 * @file restore-attendance-dialog.tsx
 * @feature attendance
 * @purpose 恢复签到确认对话框；可重选授课老师
 */

"use client"

import type { AttendanceHistoryRow } from "@/features/attendance/types/attendance-history-row.type"
import { TeacherSelect } from "@/features/teachers/components/teacher-select"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
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
  teachers: TeacherSummary[]
  teacherId: string
  onTeacherChange: (teacherId: string) => void
  restoring: boolean
  error: string | null
  onConfirm: () => void
}

export function RestoreAttendanceDialog({
  open,
  onOpenChange,
  row,
  teachers,
  teacherId,
  onTeacherChange,
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

        <TeacherSelect
          id="restore-attendance-teacher"
          teachers={teachers}
          value={teacherId}
          onChange={onTeacherChange}
          hint={
            row?.teacherName
              ? `原授课老师：${row.teacherName}；可在此更换`
              : "恢复时可指定本次授课老师"
          }
        />

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
            disabled={restoring || !row || !teacherId}
            onClick={onConfirm}
          >
            {restoring ? "恢复中…" : "确认恢复"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
