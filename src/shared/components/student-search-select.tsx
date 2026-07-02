/**
 * @file student-search-select.tsx
 * @purpose 学员可搜索选择器；支持姓名/联系人/电话模糊匹配
 */

"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import type { StudentSummary } from "@/features/students/types/student-summary.type"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

type StudentSearchSelectProps = {
  id?: string
  label?: string
  students: StudentSummary[]
  value?: string
  placeholder?: string
  className?: string
  fieldError?: string
  onChange?: (studentId: string | undefined) => void
  onQueryChange?: (query: string) => void
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase()
}

export function matchStudents(
  students: StudentSummary[],
  query: string
): StudentSummary[] {
  const normalized = normalizeSearchText(query)
  if (!normalized) {
    return students
  }

  const tokens = normalized.split(/\s+/).filter(Boolean)

  return students.filter((student) => {
    const haystack = [student.name, student.contactName, student.phone ?? ""]
      .join(" ")
      .toLowerCase()

    return tokens.every((token) => haystack.includes(token))
  })
}

export function resolveStudentIdFromQuery(
  students: StudentSummary[],
  query: string,
  selectedStudentId?: string
): string | undefined {
  if (selectedStudentId) {
    return selectedStudentId
  }

  const matches = matchStudents(students, query)
  if (matches.length === 1) {
    return matches[0].id
  }

  return undefined
}

function formatStudentLabel(student: StudentSummary): string {
  return `${student.name}（${student.contactName}）`
}

export function StudentSearchSelect({
  id = "student-search",
  label = "学员",
  students,
  value,
  placeholder = "搜索姓名、联系人或电话…",
  className,
  fieldError,
  onChange,
  onQueryChange,
}: StudentSearchSelectProps) {
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === value),
    [students, value]
  )

  const [query, setQuery] = useState(
    selectedStudent ? formatStudentLabel(selectedStudent) : ""
  )
  const [isOpen, setIsOpen] = useState(false)
  const previousValueRef = useRef(value)

  useEffect(() => {
    if (previousValueRef.current === value) {
      return
    }

    previousValueRef.current = value

    if (value && selectedStudent) {
      setQuery(formatStudentLabel(selectedStudent))
      return
    }

    if (!value) {
      setQuery("")
    }
  }, [value, selectedStudent])

  const filteredStudents = useMemo(
    () => matchStudents(students, query),
    [students, query]
  )

  function updateQuery(next: string) {
    setQuery(next)
    onQueryChange?.(next)
  }

  function handleSelect(studentId: string | undefined, labelText: string) {
    updateQuery(labelText)
    setIsOpen(false)
    onChange?.(studentId)
  }

  function handleInputChange(next: string) {
    updateQuery(next)
    setIsOpen(true)

    if (!next.trim()) {
      onChange?.(undefined)
      return
    }

    if (selectedStudent) {
      const selectedLabel = formatStudentLabel(selectedStudent)
      if (next !== selectedLabel) {
        onChange?.(undefined)
      }
    }
  }

  return (
    <div
      className={cn(
        "relative flex min-w-[200px] flex-col gap-2 overflow-visible",
        className
      )}
    >
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        aria-invalid={Boolean(fieldError)}
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 200)
        }}
      />
      {fieldError && (
        <p className="text-sm text-destructive">{fieldError}</p>
      )}
      {isOpen && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute top-[calc(100%-0.25rem)] z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-card py-1 shadow-lg"
        >
          <li role="option">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(undefined, "")}
            >
              全部学员
            </button>
          </li>
          {filteredStudents.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              未找到匹配的学员
            </li>
          ) : (
            filteredStudents.map((student) => (
              <li key={student.id} role="option">
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                    value === student.id && "bg-muted/70"
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() =>
                    handleSelect(student.id, formatStudentLabel(student))
                  }
                >
                  <span className="font-medium">{student.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    {student.contactName}
                    {student.phone ? ` · ${student.phone}` : ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
