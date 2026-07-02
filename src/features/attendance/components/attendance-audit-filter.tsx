/**

 * @file attendance-audit-filter.tsx

 * @feature attendance

 * @purpose 审计筛选；URL Query 驱动（日期 + 状态）

 */



"use client"



import Link from "next/link"

import { useRouter } from "next/navigation"

import { useEffect, useState, type FormEvent } from "react"



import { buildAttendanceAuditHref } from "@/features/attendance/lib/attendance-audit-query"

import type { AttendanceStatus } from "@/features/attendance/types/attendance-entity.type"

import { Button } from "@/shared/components/ui/button"

import { Input } from "@/shared/components/ui/input"

import { Label } from "@/shared/components/ui/label"



type AttendanceAuditFilterProps = {

  studentIdFilter?: string

  dateFromFilter?: string

  dateToFilter?: string

  statusFilter?: AttendanceStatus

  fieldErrors?: Record<string, string>

}



const selectClassName =

  "flex h-9 w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"



export function AttendanceAuditFilter({

  studentIdFilter,

  dateFromFilter,

  dateToFilter,

  statusFilter,

  fieldErrors,

}: AttendanceAuditFilterProps) {

  const router = useRouter()

  const [dateFrom, setDateFrom] = useState(dateFromFilter ?? "")

  const [dateTo, setDateTo] = useState(dateToFilter ?? "")

  const [status, setStatus] = useState(statusFilter ?? "")



  useEffect(() => {

    setDateFrom(dateFromFilter ?? "")

    setDateTo(dateToFilter ?? "")

    setStatus(statusFilter ?? "")

  }, [dateFromFilter, dateToFilter, statusFilter])



  function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault()



    const statusValue =

      status === "VALID" || status === "VOIDED" ? status : undefined



    router.push(

      buildAttendanceAuditHref({

        studentId: studentIdFilter,

        dateFrom: dateFrom || undefined,

        dateTo: dateTo || undefined,

        status: statusValue,

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



      <div className="flex flex-col gap-2">

        <Label htmlFor="status">状态</Label>

        <select

          id="status"

          name="status"

          value={status}

          onChange={(event) => setStatus(event.target.value)}

          className={selectClassName}

          aria-invalid={Boolean(fieldErrors?.status)}

        >

          <option value="">全部</option>

          <option value="VALID">有效</option>

          <option value="VOIDED">已撤销</option>

        </select>

        {fieldErrors?.status && (

          <p className="text-sm text-destructive">{fieldErrors.status}</p>

        )}

      </div>



      <Button type="submit">筛选</Button>



      {(dateFromFilter || dateToFilter || statusFilter) && (

        <Link

          href={buildAttendanceAuditHref({ studentId: studentIdFilter })}

          className="pb-2 text-sm font-medium text-primary underline-offset-4 hover:underline"

        >

          清除筛选

        </Link>

      )}

    </form>

  )

}


