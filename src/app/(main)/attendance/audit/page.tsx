/**
 * @file page.tsx
 * @feature attendance
 * @purpose /attendance/audit 路由薄层
 */

import { listAttendanceAuditAction } from "@/features/attendance/actions/list-attendance-audit.action"
import { AttendanceAuditPage } from "@/features/attendance/components/attendance-audit-page"
import {
  buildListAttendanceAuditInput,
  parseAuditStatusFilter,
} from "@/features/attendance/lib/attendance-audit-query"
import { getStudentAction } from "@/features/students/actions/get-student.action"

type AttendanceAuditRoutePageProps = {
  searchParams: Promise<{
    studentId?: string
    dateFrom?: string
    dateTo?: string
    status?: string
  }>
}

export default async function AttendanceAuditRoutePage({
  searchParams,
}: AttendanceAuditRoutePageProps) {
  const { studentId, dateFrom, dateTo, status } = await searchParams
  const statusFilter = parseAuditStatusFilter(status)

  const listInput = buildListAttendanceAuditInput({
    studentId,
    dateFrom,
    dateTo,
    status: statusFilter,
  })

  const result = await listAttendanceAuditAction(listInput)

  let filterStudentName: string | undefined
  if (studentId && result.success) {
    const studentResult = await getStudentAction(studentId)
    if (studentResult.success) {
      filterStudentName = studentResult.data.name
    }
  }

  return (
    <AttendanceAuditPage
      initialRows={result.success ? result.data : []}
      initialLoadError={
        result.success
          ? undefined
          : result.errorType === "VALIDATION_ERROR"
            ? undefined
            : (result.message ?? "加载签到审计失败")
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
