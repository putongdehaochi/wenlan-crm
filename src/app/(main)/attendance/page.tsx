/**
 * @file page.tsx
 * @feature attendance
 * @purpose /attendance 路由薄层；服务端加载今日签到名单
 */

import { listTodayAttendanceAction } from "@/features/attendance/actions/list-today-attendance.action"
import { AttendancePage } from "@/features/attendance/components/attendance-page"
import { listSavedStudentGroupsAction } from "@/features/student-groups/actions/student-group.actions"
import { listStudentsAction } from "@/features/students/actions/list-students.action"

export default async function AttendanceRoutePage() {
  const [result, groupsResult, studentsResult] = await Promise.all([
    listTodayAttendanceAction(),
    listSavedStudentGroupsAction(),
    listStudentsAction(),
  ])

  return (
    <AttendancePage
      initialRows={result.success ? result.data : []}
      initialLoadError={
        result.success ? undefined : (result.message ?? "加载今日签到名单失败")
      }
      savedGroups={groupsResult.success ? groupsResult.data : []}
      students={studentsResult.success ? studentsResult.data : []}
    />
  )
}
