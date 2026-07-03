/**
 * @file page.tsx
 * @feature student-groups
 */

import { listSavedStudentGroupsAction } from "@/features/student-groups/actions/student-group.actions"
import { StudentGroupsPage } from "@/features/student-groups/components/student-groups-page"
import { listStudentsAction } from "@/features/students/actions/list-students.action"

export default async function StudentGroupsRoutePage() {
  const [groupsResult, studentsResult] = await Promise.all([
    listSavedStudentGroupsAction(),
    listStudentsAction(),
  ])

  return (
    <StudentGroupsPage
      initialGroups={groupsResult.success ? groupsResult.data : []}
      students={studentsResult.success ? studentsResult.data : []}
      initialLoadError={
        groupsResult.success
          ? undefined
          : (groupsResult.message ?? "加载分组失败")
      }
    />
  )
}
