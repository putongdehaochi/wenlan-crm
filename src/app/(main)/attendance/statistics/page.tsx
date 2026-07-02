/**
 * @file page.tsx
 * @feature attendance
 * @purpose /attendance/statistics 路由薄层
 */

import { getAttendanceStatisticsAction } from "@/features/attendance/actions/get-attendance-statistics.action"
import { AttendanceStatisticsPage } from "@/features/attendance/components/attendance-statistics-page"
import {
  buildGetAttendanceStatisticsInput,
  parseStatisticsStatusFilter,
} from "@/features/attendance/lib/attendance-statistics-query"
import { getStudentAction } from "@/features/students/actions/get-student.action"
import { listStudentsAction } from "@/features/students/actions/list-students.action"

type AttendanceStatisticsRoutePageProps = {
  searchParams: Promise<{
    studentId?: string
    dateFrom?: string
    dateTo?: string
    status?: string
  }>
}

export default async function AttendanceStatisticsRoutePage({
  searchParams,
}: AttendanceStatisticsRoutePageProps) {
  const { studentId, dateFrom, dateTo, status } = await searchParams
  const statusFilter = parseStatisticsStatusFilter(status)

  const input = buildGetAttendanceStatisticsInput({
    studentId,
    dateFrom,
    dateTo,
    status: statusFilter,
  })

  const [studentsResult, result] = await Promise.all([
    listStudentsAction(),
    getAttendanceStatisticsAction(input),
  ])

  let filterStudentName: string | undefined
  if (studentId && result.success) {
    const studentResult = await getStudentAction(studentId)
    if (studentResult.success) {
      filterStudentName = studentResult.data.name
    }
  }

  return (
    <AttendanceStatisticsPage
      students={studentsResult.success ? studentsResult.data : []}
      initialSummary={result.success ? result.data : null}
      initialLoadError={
        result.success
          ? undefined
          : result.errorType === "VALIDATION_ERROR"
            ? undefined
            : (result.message ?? "加载签到统计失败")
      }
      initialFieldErrors={
        !result.success && result.errorType === "VALIDATION_ERROR"
          ? result.fieldErrors
          : undefined
      }
      studentIdFilter={studentId}
      dateFromFilter={dateFrom}
      dateToFilter={dateTo}
      statusFilter={statusFilter}
      filterStudentName={filterStudentName}
    />
  )
}
