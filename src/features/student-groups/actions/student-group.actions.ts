"use server"

import { studentGroupService } from "@/features/student-groups/services/student-group.service"
import type { StudentGroupSummary } from "@/features/student-groups/types/student-group-summary.type"
import type { StudentGroupActionResult } from "@/features/student-groups/services/student-group.service"

export async function listSavedStudentGroupsAction(): Promise<
  StudentGroupActionResult<StudentGroupSummary[]>
> {
  return studentGroupService.listSavedStudentGroups()
}

export async function createSavedStudentGroupAction(input: {
  name: string
  studentIds: string[]
}): Promise<StudentGroupActionResult<StudentGroupSummary>> {
  return studentGroupService.createSavedStudentGroup(input)
}

export async function updateSavedStudentGroupAction(input: {
  id: string
  name?: string
  studentIds?: string[]
}): Promise<StudentGroupActionResult<StudentGroupSummary>> {
  return studentGroupService.updateSavedStudentGroup(input)
}

export async function deleteSavedStudentGroupAction(
  id: string
): Promise<StudentGroupActionResult<{ id: string }>> {
  return studentGroupService.deleteSavedStudentGroup(id)
}
