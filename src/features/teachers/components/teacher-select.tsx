/**
 * @file teacher-select.tsx
 * @feature teachers
 */

"use client"

import type { TeacherSummary } from "@/features/teachers/types/teacher-summary.type"
import { Label } from "@/shared/components/ui/label"

type TeacherSelectProps = {
  id?: string
  label?: string
  teachers: TeacherSummary[]
  value: string
  onChange: (teacherId: string) => void
  hint?: string
  includeSystemDefaultOption?: boolean
}

const selectClassName =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"

export function getDefaultTeacherId(teachers: TeacherSummary[]): string {
  return (
    teachers.find((teacher) => teacher.isDefault)?.id ??
    teachers[0]?.id ??
    ""
  )
}

export function TeacherSelect({
  id = "teacher-select",
  label = "授课老师",
  teachers,
  value,
  onChange,
  hint,
  includeSystemDefaultOption = false,
}: TeacherSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={selectClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {includeSystemDefaultOption && (
          <option value="">使用系统默认老师</option>
        )}
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.name}
            {teacher.isDefault ? "（默认）" : ""}
          </option>
        ))}
      </select>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}
