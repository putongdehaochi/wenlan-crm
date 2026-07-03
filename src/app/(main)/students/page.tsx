/**
 * @file page.tsx
 * @feature students
 * @purpose /students 路由薄层；服务端加载初始列表
 */

import { listStudentsAction } from "@/features/students/actions/list-students.action"
import { StudentsPage } from "@/features/students/components/students-page"

export const dynamic = "force-dynamic"

export default async function StudentsRoutePage() {
  const result = await listStudentsAction()

  return (
    <StudentsPage
      initialSummaries={result.success ? result.data : []}
      initialLoadError={
        result.success ? undefined : (result.message ?? "加载学生列表失败")
      }
    />
  )
}
