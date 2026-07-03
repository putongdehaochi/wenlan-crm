"use server"

import { studentGroupService } from "@/features/student-groups/services/student-group.service"
import type { StudentGroupSummary } from "@/features/student-groups/types/student-group-summary.type"
import type { StudentGroupActionResult } from "@/features/student-groups/services/student-group.service"
import { revalidateSharedAppDataPaths } from "@/shared/lib/revalidate-app-paths"

export async function listSavedStudentGroupsAction(): Promise<
  StudentGroupActionResult<StudentGroupSummary[]>
> {
  return studentGroupService.listSavedStudentGroups()
}

export async function createSavedStudentGroupAction(input: {
  name: string
  studentIds: string[]
  teacherId?: string | null
}): Promise<StudentGroupActionResult<StudentGroupSummary>> {
  const result = await studentGroupService.createSavedStudentGroup(input)
  if (result.success) {
    revalidateSharedAppDataPaths()
  }
  return result
}

export async function updateSavedStudentGroupAction(input: {
  id: string
  name?: string
  studentIds?: string[]
  teacherId?: string | null
}): Promise<StudentGroupActionResult<StudentGroupSummary>> {
  const result = await studentGroupService.updateSavedStudentGroup(input)
  if (result.success) {
    revalidateSharedAppDataPaths()
  }
  return result
}

export async function deleteSavedStudentGroupAction(
  id: string
): Promise<StudentGroupActionResult<{ id: string }>> {
  const result = await studentGroupService.deleteSavedStudentGroup(id)
  if (result.success) {
    revalidateSharedAppDataPaths()
  }
  return result
}
