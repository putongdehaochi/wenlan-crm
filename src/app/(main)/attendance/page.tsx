/**
 * @file page.tsx
 * @feature attendance
 * @purpose /attendance 路由薄层；服务端加载今日签到名单
 */

import { listTodayAttendanceAction } from "@/features/attendance/actions/list-today-attendance.action"
import { AttendancePage } from "@/features/attendance/components/attendance-page"

export default async function AttendanceRoutePage() {
  const result = await listTodayAttendanceAction()

  return (
    <AttendancePage
      initialRows={result.success ? result.data : []}
      initialLoadError={
        result.success ? undefined : (result.message ?? "加载今日签到名单失败")
      }
    />
  )
}
