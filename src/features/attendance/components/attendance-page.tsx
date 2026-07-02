/**

 * @file attendance-page.tsx

 * @feature attendance

 * @purpose 今日签到页容器；编排 UI 状态与 Server Actions

 */



"use client"



import { useCallback, useState } from "react"



import { checkInStudentAction } from "@/features/attendance/actions/check-in-student.action"

import { listTodayAttendanceAction } from "@/features/attendance/actions/list-today-attendance.action"

import { restoreAttendanceAction } from "@/features/attendance/actions/restore-attendance.action"

import { AttendanceTodayList } from "@/features/attendance/components/attendance-today-list"

import type { AttendanceTodayRow } from "@/features/attendance/types/attendance-today-row.type"

import { PageShell } from "@/shared/components/page-shell"

import { appToast } from "@/shared/lib/toast"



type AttendancePageProps = {

  initialRows: AttendanceTodayRow[]

  initialLoadError?: string

}



function formatTodayLabel(): string {

  return new Date().toLocaleDateString("zh-CN", {

    year: "numeric",

    month: "long",

    day: "numeric",

    weekday: "long",

  })

}



export function AttendancePage({

  initialRows,

  initialLoadError,

}: AttendancePageProps) {

  const [rows, setRows] = useState(initialRows)

  const [listError, setListError] = useState(initialLoadError ?? null)

  const [checkingInId, setCheckingInId] = useState<string | null>(null)

  const [restoringId, setRestoringId] = useState<string | null>(null)

  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})



  const refreshList = useCallback(async () => {

    const result = await listTodayAttendanceAction()

    if (result.success) {

      setRows(result.data)

      setListError(null)

    } else {

      setListError(result.message ?? "加载失败")

    }

  }, [])



  function clearRowError(studentId: string) {

    setRowErrors((prev) => {

      const next = { ...prev }

      delete next[studentId]

      return next

    })

  }



  async function handleCheckIn(studentId: string) {

    const studentName = rows.find((row) => row.id === studentId)?.name

    setCheckingInId(studentId)

    clearRowError(studentId)



    const result = await checkInStudentAction({ studentId })



    if (result.success) {

      await refreshList()

      setCheckingInId(null)

      appToast.success(

        studentName ? `${studentName} 签到成功` : "签到成功",

        "课时已自动扣减"

      )

      return

    }



    const message = result.message ?? "签到失败，请稍后重试"

    setRowErrors((prev) => ({

      ...prev,

      [studentId]: message,

    }))

    appToast.error(message)

    setCheckingInId(null)

  }



  async function handleRestore(attendanceId: string) {

    const row = rows.find((item) => item.attendanceId === attendanceId)

    if (!row) return



    setRestoringId(attendanceId)

    clearRowError(row.id)



    const result = await restoreAttendanceAction({ attendanceId })



    if (result.success) {

      await refreshList()

      setRestoringId(null)

      appToast.success(

        row.name ? `${row.name} 已恢复签到` : "已恢复签到",

        "课时已重新扣减"

      )

      return

    }



    const message = result.message ?? "恢复失败，请稍后重试"

    setRowErrors((prev) => ({

      ...prev,

      [row.id]: message,

    }))

    appToast.error(message)

    setRestoringId(null)

  }



  return (

    <PageShell title="今日签到" description={formatTodayLabel()}>

      {listError && (

        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">

          {listError}

        </p>

      )}



      <AttendanceTodayList

        rows={rows}

        checkingInId={checkingInId}

        restoringId={restoringId}

        rowErrors={rowErrors}

        onCheckIn={handleCheckIn}

        onRestore={handleRestore}

      />

    </PageShell>

  )

}


