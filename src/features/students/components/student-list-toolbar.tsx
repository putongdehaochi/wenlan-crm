/**
 * @file student-list-toolbar.tsx
 * @feature students
 */

"use client"

import type { StudentSortKey } from "@/features/students/lib/student-search"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

type StudentListToolbarProps = {
  searchQuery: string
  sortKey: StudentSortKey
  resultCount: number
  totalCount: number
  onSearchChange: (value: string) => void
  onSortChange: (value: StudentSortKey) => void
}

const selectClassName =
  "flex h-9 min-w-[160px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function StudentListToolbar({
  searchQuery,
  sortKey,
  resultCount,
  totalCount,
  onSearchChange,
  onSortChange,
}: StudentListToolbarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border/80 bg-card px-4 py-4 shadow-sm">
      <div className="flex min-w-[240px] flex-1 flex-col gap-2">
        <Label htmlFor="student-search">搜索学员</Label>
        <Input
          id="student-search"
          placeholder="姓名、联系人或电话…"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="student-sort">排序</Label>
        <select
          id="student-sort"
          value={sortKey}
          onChange={(event) =>
            onSortChange(event.target.value as StudentSortKey)
          }
          className={selectClassName}
        >
          <option value="name-asc">姓名 A → Z</option>
          <option value="name-desc">姓名 Z → A</option>
          <option value="balance-desc">课时余额 高 → 低</option>
          <option value="balance-asc">课时余额 低 → 高</option>
        </select>
      </div>

      <p className="pb-2 text-sm text-muted-foreground">
        显示 {resultCount} / {totalCount} 人
      </p>
    </div>
  )
}
