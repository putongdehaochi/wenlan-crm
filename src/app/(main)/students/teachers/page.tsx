/**
 * @file page.tsx
 * @feature teachers
 */

import { listTeachersAction } from "@/features/teachers/actions/teacher.actions"
import { TeachersPage } from "@/features/teachers/components/teachers-page"

export const dynamic = "force-dynamic"

export default async function TeachersRoutePage() {
  const result = await listTeachersAction()

  return (
    <TeachersPage
      initialTeachers={result.success ? result.data : []}
      initialLoadError={
        result.success ? undefined : (result.message ?? "加载老师列表失败")
      }
    />
  )
}
