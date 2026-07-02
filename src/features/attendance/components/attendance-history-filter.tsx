/**
 * @file attendance-history-filter.tsx
 * @feature attendance
 * @purpose 历史日期筛选；通过 URL Query 驱动
 */

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, type FormEvent } from "react"

import { buildAttendanceHistoryHref } from "@/features/attendance/lib/attendance-history-query"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"

type AttendanceHistoryFilterProps = {
  studentIdFilter?: string
  dateFromFilter?: string
  dateToFilter?: string
  fieldErrors?: Record<string, string>
}

export function AttendanceHistoryFilter({
  studentIdFilter,
  dateFromFilter,
  dateToFilter,
  fieldErrors,
}: AttendanceHistoryFilterProps) {
  const router = useRouter()
  const [dateFrom, setDateFrom] = useState(dateFromFilter ?? "")
  const [dateTo, setDateTo] = useState(dateToFilter ?? "")

  useEffect(() => {
    setDateFrom(dateFromFilter ?? "")
    setDateTo(dateToFilter ?? "")
  }, [dateFromFilter, dateToFilter])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    router.push(
      buildAttendanceHistoryHref({
        studentId: studentIdFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 rounded-lg border bg-muted/20 px-4 py-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="dateFrom">开始日期</Label>
        <Input
          id="dateFrom"
          name="dateFrom"
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.dateFrom)}
        />
        {fieldErrors?.dateFrom && (
          <p className="text-sm text-destructive">{fieldErrors.dateFrom}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="dateTo">结束日期</Label>
        <Input
          id="dateTo"
          name="dateTo"
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          aria-invalid={Boolean(fieldErrors?.dateTo)}
        />
        {fieldErrors?.dateTo && (
          <p className="text-sm text-destructive">{fieldErrors.dateTo}</p>
        )}
      </div>

      <Button type="submit">筛选</Button>

      {(dateFromFilter || dateToFilter) && (
        <Link
          href={buildAttendanceHistoryHref({ studentId: studentIdFilter })}
          className="pb-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          清除日期
        </Link>
      )}
    </form>
  )
}
