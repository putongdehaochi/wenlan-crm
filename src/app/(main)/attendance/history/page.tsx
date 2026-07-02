/**
 * @file page.tsx
 * @feature attendance
 * @purpose /attendance/history 路由薄层；服务端加载签到历史
 */

import { listAttendanceHistoryAction } from "@/features/attendance/actions/list-attendance-history.action"
import { AttendanceHistoryPage } from "@/features/attendance/components/attendance-history-page"
import { buildListAttendanceHistoryInput } from "@/features/attendance/lib/attendance-history-query"
import { getStudentAction } from "@/features/students/actions/get-student.action"

type AttendanceHistoryRoutePageProps = {
  searchParams: Promise<{
    studentId?: string
    dateFrom?: string
    dateTo?: string
  }>
}

export default async function AttendanceHistoryRoutePage({
  searchParams,
}: AttendanceHistoryRoutePageProps) {
  const { studentId, dateFrom, dateTo } = await searchParams

  const listInput = buildListAttendanceHistoryInput({
    studentId,
    dateFrom,
    dateTo,
  })

  const result = await listAttendanceHistoryAction(listInput)

  let filterStudentName: string | undefined
  if (studentId && result.success) {
    const studentResult = await getStudentAction(studentId)
    if (studentResult.success) {
      filterStudentName = studentResult.data.name
    }
  }

  return (
    <AttendanceHistoryPage
      initialRows={result.success ? result.data : []}
      initialLoadError={
        result.success
          ? undefined
          : result.errorType === "VALIDATION_ERROR"
            ? undefined
            : (result.message ?? "加载签到历史失败")
      }
      initialFieldErrors={
        !result.success && result.errorType === "VALIDATION_ERROR"
          ? result.fieldErrors
          : undefined
      }
      studentIdFilter={studentId}
      dateFromFilter={dateFrom}
      dateToFilter={dateTo}
      filterStudentName={filterStudentName}
    />
  )
}
