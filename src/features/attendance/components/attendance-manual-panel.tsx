/**
 * @file attendance-manual-panel.tsx
 * @feature attendance
 */

"use client"

import { useMemo, useState } from "react"

import type { AttendanceTodayRow } from "@/features/attendance/types/attendance-today-row.type"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { TeacherSelect } from "@/features/teachers/components/teacher-select"
import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import {
  StudentSearchSelect,
} from "@/shared/components/student-search-select"
import { Button } from "@/shared/components/ui/button"

type AttendanceManualPanelProps = {
  students: StudentSummary[]
  rows: AttendanceTodayRow[]
  teachers: TeacherSummary[]
  selectedTeacherId: string
  onTeacherChange: (teacherId: string) => void
  checkingInId: string | null
  onCheckIn: (studentId: string) => void
}

export function AttendanceManualPanel({
  students,
  rows,
  teachers,
  selectedTeacherId,
  onTeacherChange,
  checkingInId,
  onCheckIn,
}: AttendanceManualPanelProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>()

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedStudentId),
    [rows, selectedStudentId]
  )

  const quickHint = "手动模式适合临时补签：搜索学员后点击「立即签到」。"

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <TeacherSelect
        id="attendance-manual-teacher"
        teachers={teachers}
        value={selectedTeacherId}
        onChange={onTeacherChange}
        hint="单人签到需指定授课老师，默认使用系统默认老师"
      />

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <StudentSearchSelect
          label="搜索学员"
          students={students}
          value={selectedStudentId}
          onChange={setSelectedStudentId}
        />
        <Button
          type="button"
          disabled={
            !selectedStudentId ||
            checkingInId === selectedStudentId ||
            selectedRow?.canCheckIn === false
          }
          onClick={() => {
            if (selectedStudentId) {
              onCheckIn(selectedStudentId)
            }
          }}
        >
          {checkingInId === selectedStudentId ? "签到中…" : "立即签到"}
        </Button>
      </div>

      {selectedRow && (
        <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm">
          <p className="font-medium">{selectedRow.name}</p>
          <p className="mt-1 text-muted-foreground">
            课时余额 {selectedRow.lessonBalance} · 今日状态{" "}
            {selectedRow.todayStatus === "CHECKED_IN"
              ? "已签到"
              : selectedRow.todayStatus === "VOIDED"
                ? "已撤销"
                : "未签到"}
          </p>
          {!selectedRow.canCheckIn && (
            <p className="mt-2 text-destructive">
              {selectedRow.todayStatus === "CHECKED_IN"
                ? "今日已签到"
                : selectedRow.todayStatus === "VOIDED"
                  ? "请先恢复签到"
                  : selectedRow.lessonBalance < 1
                    ? "课时不足"
                    : "当前不可签到"}
            </p>
          )}
        </div>
      )}

      <p className="text-sm text-muted-foreground">{quickHint}</p>
    </div>
  )
}
