/**
 * @file student-group-member-picker.tsx
 * @feature student-groups
 */

"use client"

import { useMemo, useState } from "react"

import { matchStudents } from "@/shared/components/student-search-select"
import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

type StudentGroupMemberPickerProps = {
  students: StudentSummary[]
  selectedIds: string[]
  onChange: (studentIds: string[]) => void
  fieldError?: string
}

export function StudentGroupMemberPicker({
  students,
  selectedIds,
  onChange,
  fieldError,
}: StudentGroupMemberPickerProps) {
  const [query, setQuery] = useState("")

  const filteredStudents = useMemo(
    () => matchStudents(students, query),
    [students, query]
  )

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  function toggleStudent(studentId: string) {
    if (selectedSet.has(studentId)) {
      onChange(selectedIds.filter((id) => id !== studentId))
      return
    }
    onChange([...selectedIds, studentId])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label>选择学员</Label>
        <span className="text-xs text-muted-foreground">
          已选 {selectedIds.length} 人
        </span>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索姓名、联系人或电话…"
      />

      <div className="max-h-56 overflow-y-auto rounded-lg border border-border/80">
        {filteredStudents.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            没有匹配的学员
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {filteredStudents.map((student) => {
              const checked = selectedSet.has(student.id)
              return (
                <li key={student.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/40",
                      checked && "bg-muted/30"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStudent(student.id)}
                      className="size-4 rounded border-border"
                    />
                    <span className="font-medium">{student.name}</span>
                    <span className="text-muted-foreground">
                      {student.contactName}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {fieldError && (
        <p className="text-sm text-destructive">{fieldError}</p>
      )}
    </div>
  )
}
