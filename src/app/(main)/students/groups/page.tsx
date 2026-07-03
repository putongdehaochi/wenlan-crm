/**
 * @file page.tsx
 * @feature student-groups
 */

import { listSavedStudentGroupsAction } from "@/features/student-groups/actions/student-group.actions"
import { StudentGroupsPage } from "@/features/student-groups/components/student-groups-page"
import { listStudentsAction } from "@/features/students/actions/list-students.action"
import { listTeachersAction } from "@/features/teachers/actions/teacher.actions"

export const dynamic = "force-dynamic"

export default async function StudentGroupsRoutePage() {
  const [groupsResult, studentsResult, teachersResult] = await Promise.all([
    listSavedStudentGroupsAction(),
    listStudentsAction(),
    listTeachersAction(),
  ])

  return (
    <StudentGroupsPage
      initialGroups={groupsResult.success ? groupsResult.data : []}
      students={studentsResult.success ? studentsResult.data : []}
      teachers={teachersResult.success ? teachersResult.data : []}
      initialLoadError={
        groupsResult.success
          ? undefined
          : (groupsResult.message ?? "加载分组失败")
      }
    />
  )
}
